'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface FiltersProps {
  onFilterChange: (filters: {
    q?: string;
    type?: string;
    from?: string;
    to?: string;
  }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ q: e.target.value || undefined });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({ type: value === 'all' ? undefined : value });
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ from: e.target.value || undefined });
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ to: e.target.value || undefined });
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by reference..."
            onChange={handleSearchChange}
            data-testid="search-input"
          />
        </div>
        <Select onValueChange={handleTypeChange} defaultValue="all">
          <SelectTrigger className="w-32" data-testid="type-select">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="date"
            onChange={handleFromChange}
            data-testid="from-date-input"
          />
        </div>
        <div className="flex-1">
          <Input
            type="date"
            onChange={handleToChange}
            data-testid="to-date-input"
          />
        </div>
      </div>
    </div>
  );
}
