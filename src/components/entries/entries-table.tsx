"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EntryRecord } from "./entry-form";

export function EntriesTable({
  entries,
  canEdit,
  onEdit,
}: {
  entries: (EntryRecord & { user?: { username: string } })[];
  canEdit?: boolean;
  onEdit?: (entry: EntryRecord) => void;
}) {
  if (!entries.length) {
    return (
      <p className="text-center text-muted-foreground py-8">No entries found.</p>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            {entries[0]?.user && <TableHead>User</TableHead>}
            <TableHead>System</TableHead>
            <TableHead>Online</TableHead>
            <TableHead>Number</TableHead>
            <TableHead>Bonus</TableHead>
            <TableHead>Win</TableHead>
            <TableHead>Cash</TableHead>
            <TableHead>Note</TableHead>
            {canEdit && <TableHead className="w-20" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{formatDate(e.date)}</TableCell>
              {e.user && <TableCell>{e.user.username}</TableCell>}
              <TableCell>{formatCurrency(e.system)}</TableCell>
              <TableCell>{formatCurrency(e.online)}</TableCell>
              <TableCell>{formatCurrency(e.number)}</TableCell>
              <TableCell>{formatCurrency(e.bonus)}</TableCell>
              <TableCell>{formatCurrency(e.win)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(e.cash)}
              </TableCell>
              <TableCell className="max-w-[120px] truncate text-muted-foreground">
                {e.note || "—"}
              </TableCell>
              {canEdit && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(e)}
                    title="Edit entry"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
