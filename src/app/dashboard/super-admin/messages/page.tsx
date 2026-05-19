"use client";

import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { DashboardShell, superAdminNav } from "@/components/layout/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";

interface Message {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  admin: { username: string };
}

export default function SuperAdminMessagesPage() {
  const setUnreadMessages = useAppStore((s) => s.setUnreadMessages);
  const [messages, setMessages] = useState<Message[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/messages");
    const data = await res.json();
    setMessages(data.messages ?? []);
    setUnreadMessages(data.unreadCount ?? 0);
  }, [setUnreadMessages]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const markRead = async (id: string) => {
    await fetch(`/api/messages/${id}`, { method: "PATCH" });
    load();
  };

  return (
    <DashboardShell navItems={superAdminNav} title="Messages from Admins">
      <div className="space-y-4">
        {messages.length === 0 && (
          <p className="text-muted-foreground text-center py-12">No messages yet.</p>
        )}
        {messages.map((m) => (
          <Card key={m.id} className={!m.read ? "border-primary/50" : ""}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  From: {m.admin.username}
                  {!m.read && <Badge>New</Badge>}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(m.createdAt), "PPpp")}
                </p>
              </div>
              {!m.read && (
                <Button size="sm" variant="outline" onClick={() => markRead(m.id)}>
                  Mark as read
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{m.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardShell>
  );
}
