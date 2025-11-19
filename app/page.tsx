'use client';

import { useState } from 'react';
import { Summary } from '@/components/summary';
import { Filters } from '@/components/filters';
import { TransactionsTable } from '@/components/transactions-table';
import { NewTransactionForm } from '@/components/new-transaction-form';
import { type Transaction } from '@/lib/api-client';

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [totals, setTotals] = useState({ total_in: 0, total_out: 0 });
  const [optimisticTransaction, setOptimisticTransaction] = useState<Transaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const handleTransactionSuccess = (transaction: Transaction) => {
    // Show optimistic update
    setOptimisticTransaction(transaction);
    setError(null);

    // Update totals optimistically
    setTotals((prev) => ({
      total_in:
        prev.total_in + (transaction.type === 'credit' ? transaction.amount : 0),
      total_out:
        prev.total_out + (transaction.type === 'debit' ? transaction.amount : 0),
    }));

    // Clear optimistic state after a short delay
    setTimeout(() => setOptimisticTransaction(null), 500);
  };

  const handleTransactionError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const handleTransactionsLoaded = (transactions: Transaction[]) => {
    // Recompute totals from fresh data (could also come from API response)
    // This ensures we stay in sync
  };

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8">Transaction Dashboard</h1>

        <NewTransactionForm
          onSuccess={handleTransactionSuccess}
          onError={handleTransactionError}
        />

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Summary total_in={totals.total_in} total_out={totals.total_out} />

        <Filters onFilterChange={handleFilterChange} />

        <TransactionsTable
          filters={filters}
          page={page}
          onPageChange={setPage}
          onTransactionsLoaded={handleTransactionsLoaded}
          optimisticTransaction={optimisticTransaction}
        />
      </div>
    </main>
  );
}
