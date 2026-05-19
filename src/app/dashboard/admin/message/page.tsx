"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardShell, adminNav } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/use-app-store";

export default function AdminMessagePage() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const addToast = useAppStore((s) => s.addToast);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    setLoading(false);
    const json = await res.json();
    if (!res.ok) {
      addToast({ type: "error", title: json.error ?? "Failed to send" });
      return;
    }
    addToast({ type: "success", title: "Message sent to Super Admin" });
    setContent("");
  };

  return (
    <DashboardShell navItems={adminNav} title="Message Super Admin">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Contact Super Admin</CardTitle>
          <CardDescription>
            Send a single message to the super admin. They will be notified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type your message..."
                required
              />
            </div>
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
