"use client";

import { useEffect, useState } from "react";
import { DashboardShell, superAdminNav } from "@/components/layout/dashboard-shell";
import { StatsCards } from "@/components/stats-cards";
import { EntriesTable } from "@/components/entries/entries-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";
import type { EntryRecord } from "@/components/entries/entry-form";

export default function SuperAdminOverviewPage() {
  const setUnreadMessages = useAppStore((s) => s.setUnreadMessages);
  const [stats, setStats] = useState<Parameters<typeof StatsCards>[0]["stats"] | null>(null);
  const [entries, setEntries] = useState<EntryRecord[]>([]);

  useEffect(() => {
    async function load() {
      const [statsRes, entriesRes, messagesRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/entries"),
        fetch("/api/messages"),
      ]);
      const statsData = await statsRes.json();
      const entriesData = await entriesRes.json();
      const messagesData = await messagesRes.json();
      setStats(statsData);
      setEntries(entriesData.slice(0, 20));
      setUnreadMessages(messagesData.unreadCount ?? 0);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [setUnreadMessages]);

  return (
    <DashboardShell navItems={superAdminNav} title="Super Admin Overview">
      {stats && <StatsCards stats={stats} />}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity (latest 20 entries)</CardTitle>
        </CardHeader>
        <CardContent>
          <EntriesTable entries={entries} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
