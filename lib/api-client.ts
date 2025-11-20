const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://wallet-transactions-production-fe3f.up.railway.app/api';

interface TransactionFilters {
  q?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  per_page?: number;
}

interface Transaction {
  id: string;
  reference: string;
  type: 'credit' | 'debit';
  amount: number;
  created_at: string;
  wallet_id: number;
}

interface TransactionsResponse {
  data: Transaction[];
  total_in: number;
  total_out: number;
  total_count: number;
  page: number;
  per_page: number;
}

interface NewTransactionPayload {
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  wallet_id: number;
  idempotency_key: string;
}

export async function fetchTransactions(filters: TransactionFilters): Promise<TransactionsResponse> {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  params.append('page', String(filters.page || 1));
  params.append('per_page', String(filters.per_page || 10));

  const response = await fetch(`${API_BASE}/transactions?${params.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function createTransaction(payload: NewTransactionPayload): Promise<Transaction> {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Failed to create transaction');
  return response.json();
}

export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
