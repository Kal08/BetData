"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { DashboardShell, superAdminNav } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/use-app-store";

interface UserRow {
  id: string;
  username: string;
  role: string;
  canEditEntries: boolean;
  _count: { entries: number };
}

export default function SuperAdminUsersPage() {
  const addToast = useAppStore((s) => s.addToast);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [role, setRole] = useState<"ADMIN" | "USER">("USER");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPass, setNewPass] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/users");
    setUsers(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });
    setLoading(false);
    const json = await res.json();
    if (!res.ok) {
      addToast({ type: "error", title: json.error ?? "Failed" });
      return;
    }
    addToast({ type: "success", title: `${role} created` });
    setUsername("");
    setPassword("");
    load();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast({ type: "success", title: "User deleted" });
      load();
    } else {
      const json = await res.json();
      addToast({ type: "error", title: json.error });
    }
  };

  const resetPassword = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPass }),
    });
    if (res.ok) {
      addToast({ type: "success", title: "Password reset" });
      setResetId(null);
      setNewPass("");
    }
  };

  return (
    <DashboardShell navItems={superAdminNav} title="User Management">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Admin or User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Role</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as "ADMIN" | "USER")}
              >
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <Label>Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Admins & Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Entries</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{u.role}</Badge>
                  </TableCell>
                  <TableCell>{u._count.entries}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setResetId(u.id)}
                    >
                      Reset password
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteUser(u.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {resetId && (
            <div className="mt-4 flex gap-2 items-end border-t pt-4">
              <div className="flex-1">
                <Label>New password</Label>
                <Input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>
              <Button onClick={() => resetPassword(resetId)}>Save</Button>
              <Button variant="ghost" onClick={() => setResetId(null)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
