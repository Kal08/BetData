"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DashboardShell, userNav } from "@/components/layout/dashboard-shell";
import { EntryForm, type EntryRecord } from "@/components/entries/entry-form";
import { EntriesTable } from "@/components/entries/entries-table";
import { StatsCards } from "@/components/stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserDashboardPage() {
  const { data: session, update } = useSession();
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [stats, setStats] = useState<{
    entryCount: number;
    totals: { cash: number; win: number; bonus: number; system: number; online: number; number: number };
  } | null>(null);
  const [editing, setEditing] = useState<EntryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [entriesRes, statsRes] = await Promise.all([
      fetch("/api/entries"),
      fetch("/api/stats"),
    ]);
    const entriesData = await entriesRes.json();
    const statsData = await statsRes.json();
    setEntries(entriesData);
    setStats(statsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Refresh session canEdit from server periodically
  useEffect(() => {
    update();
  }, [update]);

  const canEdit = session?.user?.canEditEntries ?? false;

  return (
    <DashboardShell navItems={userNav} title="My Dashboard">
      {stats && <StatsCards stats={{ ...stats, userCount: undefined }} />}

      {!editing ? (
        <EntryForm onSuccess={load} />
      ) : (
        <EntryForm
          initial={editing}
          onSuccess={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Entry History</CardTitle>
          {!canEdit && (
            <p className="text-sm text-muted-foreground">
              Editing is disabled. Contact your admin to enable edits.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <EntriesTable
              entries={entries}
              canEdit={canEdit}
              onEdit={(e) => setEditing(e)}
            />
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
