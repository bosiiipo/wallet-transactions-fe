'use client';

import { useState } from 'react';
import { createTransaction, generateUUID, type Transaction } from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NewTransactionFormProps {
  onSuccess: (transaction: Transaction) => void;
  onError: (error: string) => void;
}

export function NewTransactionForm({ onSuccess, onError }: NewTransactionFormProps) {
  const [type, setType] = useState<'credit' | 'debit'>('credit');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!reference.trim()) {
      errors.reference = 'Reference is required';
    }

    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const idempotencyKey = generateUUID();
      const transaction = await createTransaction({
        type,
        amount: parseFloat(amount),
        reference: reference.trim(),
        wallet_id: 1,
        idempotency_key: idempotencyKey,
      });

      onSuccess(transaction);
      setReference('');
      setAmount('');
      setType('credit');
      setValidationErrors({});
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create transaction';
      onError(errorMsg);
      console.error('[v0] Error creating transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <Select value={type} onValueChange={(v) => setType(v as 'credit' | 'debit')}>
                <SelectTrigger id="type" data-testid="form-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="amount" className="text-sm font-medium">
                Amount
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
                data-testid="form-amount-input"
              />
              {validationErrors.amount && (
                <p className="text-destructive text-sm mt-1">{validationErrors.amount}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="reference" className="text-sm font-medium">
              Reference
            </label>
            <Input
              id="reference"
              placeholder="e.g., INV-001"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              data-testid="form-reference-input"
            />
            {validationErrors.reference && (
              <p className="text-destructive text-sm mt-1">{validationErrors.reference}</p>
            )}
          </div>

          <input type="hidden" name="wallet_id" value="1" />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="form-submit-button"
          >
            {loading ? 'Creating...' : 'Create Transaction'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
