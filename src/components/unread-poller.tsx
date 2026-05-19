"use client";

import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";

/** Polls unread admin messages for super admin badge in sidebar */
export function UnreadPoller() {
  const { data: session } = useSession();
  const setUnreadMessages = useAppStore((s) => s.setUnreadMessages);

  useEffect(() => {
    if (session?.user?.role !== Role.SUPER_ADMIN) return;

    const poll = async () => {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setUnreadMessages(data.unreadCount ?? 0);
      }
    };

    poll();
    const id = setInterval(poll, 20000);
    return () => clearInterval(id);
  }, [session?.user?.role, setUnreadMessages]);

  return null;
}
