"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { DashboardShell, adminNav } from "@/components/layout/dashboard-shell";
import { StatsCards } from "@/components/stats-cards";
import { EntriesTable } from "@/components/entries/entries-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/store/use-app-store";
import type { EntryRecord } from "@/components/entries/entry-form";

interface ManagedUser {
  id: string;
  username: string;
  canEditEntries: boolean;
  _count: { entries: number };
}

export default function AdminDashboardPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<EntryRecord[]>([]);
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    const q = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/users${q}`);
    setUsers(await res.json());
  }, [search]);

  const loadEntries = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedUserId) params.set("userId", selectedUserId);
    if (date) params.set("date", date);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    const [entriesRes, statsRes] = await Promise.all([
      fetch(`/api/entries?${params}`),
      fetch(`/api/stats?${params}`),
    ]);
    setEntries(await entriesRes.json());
    setStats(await statsRes.json());
  }, [selectedUserId, date, dateFrom, dateTo]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const toggleEdit = async (userId: string, value: boolean) => {
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canEditEntries: value }),
    });
    if (res.ok) {
      addToast({ type: "success", title: "Edit permission updated" });
      loadUsers();
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword,
        role: "USER",
      }),
    });
    setCreating(false);
   const json = await res.json();

if (!res.ok) {
  const errorMessage = 
    json && typeof json === 'object' && 'error' in json 
      ? String((json as any).error) 
      : "Failed";

  addToast({ type: "error", title: errorMessage });
  return;
}
    addToast({ type: "success", title: "User created" });
    setShowCreate(false);
    setNewUsername("");
    setNewPassword("");
    loadUsers();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user and all their data?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast({ type: "success", title: "User deleted" });
      if (selectedUserId === id) setSelectedUserId(null);
      loadUsers();
      loadEntries();
    }
  };

  return (
    <DashboardShell navItems={adminNav} title="Admin Dashboard">
      {stats && (
        <StatsCards
          stats={stats as Parameters<typeof StatsCards>[0]["stats"]}
        />
      )}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Users</CardTitle>
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="h-4 w-4 mr-1" />
            Create User
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreate && (
            <form
              onSubmit={createUser}
              className="grid gap-3 sm:grid-cols-3 border rounded-lg p-4"
            >
              <div>
                <Label>Username</Label>
                <Input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </div>
            </form>
          )}
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Entries</TableHead>
                  <TableHead>Allow Edit</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow
                    key={u.id}
                    className={
                      selectedUserId === u.id ? "bg-primary/10" : "cursor-pointer"
                    }
                    onClick={() => setSelectedUserId(u.id)}
                  >
                    <TableCell className="font-medium">{u.username}</TableCell>
                    <TableCell>{u._count.entries}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={u.canEditEntries}
                        onCheckedChange={(v) => toggleEdit(u.id, v)}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteUser(u.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedUserId
              ? `Entries — ${users.find((u) => u.id === selectedUserId)?.username}`
              : "All User Entries"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Single date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDate("");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
          <EntriesTable entries={entries} />
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
