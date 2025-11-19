'use client';

import { useEffect, useState } from 'react';
import { fetchTransactions, type Transaction } from '@/lib/api-client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TransactionsTableProps {
  filters: {
    q?: string;
    type?: string;
    from?: string;
    to?: string;
  };
  page: number;
  onPageChange: (page: number) => void;
  onTransactionsLoaded?: (data: Transaction[]) => void;
  optimisticTransaction?: Transaction;
}

export function TransactionsTable({
  filters,
  page,
  onPageChange,
  onTransactionsLoaded,
  optimisticTransaction,
}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchTransactions({
      ...filters,
      page,
      per_page: perPage,
    })
      .then((data) => {
        setTransactions(data.data);
        setTotalCount(data.total_count);
        onTransactionsLoaded?.(data.data);
      })
      .catch((err) => {
        setError(err.message);
        console.error('[v0] Error fetching transactions:', err);
      })
      .finally(() => setLoading(false));
  }, [filters, page, onTransactionsLoaded]);

  // Add optimistic transaction to the top of the list
  const displayedTransactions = optimisticTransaction
    ? [optimisticTransaction, ...transactions]
    : transactions;

  const totalPages = Math.ceil(totalCount / perPage);

  if (error) {
    return <div className="text-destructive">Error: {error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && displayedTransactions.length === 0 && (
          <div className="text-center text-muted-foreground py-8">Loading...</div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTransactions.map((tx) => (
                <TableRow key={tx.id} data-testid={`transaction-row-${tx.reference}`}>
                  <TableCell className="font-medium">{tx.reference}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        tx.type === 'credit'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {displayedTransactions.length === 0 && !loading && (
          <div className="text-center text-muted-foreground py-8">
            No transactions found
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
