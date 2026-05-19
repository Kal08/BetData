"use client";

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  entryCount: number;
  userCount?: number;
  unreadMessages?: number;
  totals: {
    system: number;
    online: number;
    number: number;
    bonus: number;
    win: number;
    cash: number;
  };
}

export function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Entries", value: stats.entryCount.toString() },
    ...(stats.userCount !== undefined
      ? [{ label: "Users", value: stats.userCount.toString() }]
      : []),
    ...(stats.unreadMessages !== undefined && stats.unreadMessages > 0
      ? [{ label: "Unread Messages", value: stats.unreadMessages.toString() }]
      : []),
    { label: "Total Cash", value: formatCurrency(stats.totals.cash) },
    { label: "Total Win", value: formatCurrency(stats.totals.win) },
    { label: "Total Bonus", value: formatCurrency(stats.totals.bonus) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {c.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
