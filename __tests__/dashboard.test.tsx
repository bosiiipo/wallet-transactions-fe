import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionsTable } from '@/components/transactions-table';
import { NewTransactionForm } from '@/components/new-transaction-form';
import { Filters } from '@/components/filters';
import * as apiClient from '@/lib/api-client';

jest.mock('@/lib/api-client');

const mockTransactions = [
  {
    id: '1',
    reference: 'TXN-001',
    type: 'credit' as const,
    amount: 100,
    created_at: '2025-01-15T10:00:00Z',
    wallet_id: 1,
  },
  {
    id: '2',
    reference: 'TXN-002',
    type: 'debit' as const,
    amount: 50,
    created_at: '2025-01-14T10:00:00Z',
    wallet_id: 1,
  },
];

describe('Dashboard Filters', () => {
  it('should filter transactions by type and update rows', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      data: [mockTransactions[0]],
      total_in: 100,
      total_out: 0,
      total_count: 1,
      page: 1,
      per_page: 10,
    });
    (apiClient.fetchTransactions as jest.Mock).mockImplementation(mockFetch);

    const { rerender } = render(
      <div>
        <Filters onFilterChange={() => {}} />
        <TransactionsTable
          filters={{}}
          page={1}
          onPageChange={() => {}}
        />
      </div>
    );

    // Simulate filter change to 'credit' type
    const typeSelect = screen.getByTestId('type-select');
    fireEvent.click(typeSelect);

    const creditOption = screen.getByText('Credit');
    fireEvent.click(creditOption);

    // Re-render with new filters
    const { rerender: updateTable } = render(
      <TransactionsTable
        filters={{ type: 'credit' }}
        page={1}
        onPageChange={() => {}}
      />
    );

    // Verify the API was called with credit filter
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'credit',
      })
    );

    // Verify the credit transaction row is rendered
    await waitFor(() => {
      expect(screen.getByTestId('transaction-row-TXN-001')).toBeInTheDocument();
    });
  });
});

describe('New Transaction Form', () => {
  it('should submit the form and render the new row', async () => {
    const user = userEvent.setup();
    const mockCreateTransaction = jest.fn().mockResolvedValue({
      id: '3',
      reference: 'INV-001',
      type: 'credit' as const,
      amount: 250,
      created_at: '2025-01-16T10:00:00Z',
      wallet_id: 1,
    });
    (apiClient.createTransaction as jest.Mock).mockImplementation(
      mockCreateTransaction
    );
    (apiClient.generateUUID as jest.Mock).mockReturnValue(
      'uuid-1234-5678-9012'
    );

    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <NewTransactionForm onSuccess={onSuccess} onError={onError} />
    );

    // Fill form
    const typeSelect = screen.getByTestId('form-type-select');
    const amountInput = screen.getByTestId('form-amount-input');
    const referenceInput = screen.getByTestId('form-reference-input');
    const submitButton = screen.getByTestId('form-submit-button');

    await user.click(typeSelect);
    const creditOption = screen.getByText('Credit');
    await user.click(creditOption);

    await user.type(amountInput, '250');
    await user.type(referenceInput, 'INV-001');

    // Submit form
    await user.click(submitButton);

    // Wait for the form submission
    await waitFor(() => {
      expect(mockCreateTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'credit',
          amount: 250,
          reference: 'INV-001',
          wallet_id: 1,
          idempotency_key: 'uuid-1234-5678-9012',
        })
      );
    });

    // Verify success callback was called with the new transaction
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '3',
        reference: 'INV-001',
        type: 'credit',
        amount: 250,
      })
    );
  });

  it('should validate required fields before submission', async () => {
    const user = userEvent.setup();
    const onSuccess = jest.fn();
    const onError = jest.fn();

    render(
      <NewTransactionForm onSuccess={onSuccess} onError={onError} />
    );

    const submitButton = screen.getByTestId('form-submit-button');

    // Try to submit empty form
    await user.click(submitButton);

    // Verify validation errors are shown
    await waitFor(() => {
      expect(screen.getByText('Reference is required')).toBeInTheDocument();
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    });

    // Verify submit was not called
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
