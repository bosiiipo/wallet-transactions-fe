'use client';

import { Card, CardContent } from '@/components/ui/card';

interface SummaryProps {
  total_in: number;
  total_out: number;
}

export function Summary({ total_in, total_out }: SummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Total In</div>
          <div className="text-2xl font-bold text-green-600">${total_in.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Total Out</div>
          <div className="text-2xl font-bold text-red-600">${total_out.toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
