"use client";

import { useEffect, useRef } from "react";
import { CollabChannel } from "@/lib/collab-channel";
import { useCollabStore } from "@/stores/collab-store";
import type { CollabUser } from "@/lib/collab-channel";

type CollabIndicatorProps = {
  className?: string;
};

export function CollabIndicator({ className }: CollabIndicatorProps) {
  const channelRef = useRef<CollabChannel | null>(null);
  const myUserRef = useRef<CollabUser | null>(null);

  const users = useCollabStore((s) => s.users);
  const myUser = useCollabStore((s) => s.myUser);
  const isConnected = useCollabStore((s) => s.isConnected);
  const addUser = useCollabStore((s) => s.addUser);
  const removeUser = useCollabStore((s) => s.removeUser);
  const updateUser = useCollabStore((s) => s.updateUser);
  const setMyUser = useCollabStore((s) => s.setMyUser);
  const setConnected = useCollabStore((s) => s.setConnected);
  const cleanStale = useCollabStore((s) => s.cleanStale);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const channel = new CollabChannel();
    channelRef.current = channel;

    const me = channel.connect(window.location.pathname);
    myUserRef.current = me;
    setMyUser(me);
    setConnected(true);

    const unsubscribe = channel.onMessage((msg) => {
      switch (msg.type) {
        case "join":
          addUser(msg.user);
          if (myUserRef.current) {
            channel.sendHeartbeat(myUserRef.current);
          }
          break;
        case "leave":
          removeUser(msg.userId);
          break;
        case "heartbeat":
          updateUser(msg.user);
          break;
        case "activity":
          break;
      }
    });

    const heartbeatInterval = setInterval(() => {
      if (myUserRef.current) {
        myUserRef.current = { ...myUserRef.current, lastSeen: Date.now() };
        channel.sendHeartbeat(myUserRef.current);
      }
    }, 10_000);

    const cleanupInterval = setInterval(() => {
      cleanStale();
    }, 15_000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(cleanupInterval);
      unsubscribe();
      channel.disconnect();
      setMyUser(null);
      setConnected(false);
      channelRef.current = null;
    };
  }, [addUser, removeUser, updateUser, setMyUser, setConnected, cleanStale]);

  const otherUsers = Object.values(users).filter(
    (u) => myUser && u.id !== myUser.id
  );
  const totalOnline = otherUsers.length + (isConnected ? 1 : 0);
  const displayUsers = otherUsers.slice(0, 2);
  const extraCount = otherUsers.length - displayUsers.length;

  if (totalOnline <= 1) {
    return (
      <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
        <div className="h-2 w-2 rounded-full bg-green-500" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <div className="flex items-center -space-x-1.5">
        {isConnected && myUser && (
          <div
            className="relative h-6 w-6 rounded-full border-2 border-background"
            style={{ backgroundColor: myUser.color }}
            title={`${myUser.name} (あなた)`}
          />
        )}
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className="relative h-6 w-6 rounded-full border-2 border-background"
            style={{ backgroundColor: user.color }}
            title={user.name}
          />
        ))}
        {extraCount > 0 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
            +{extraCount}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{totalOnline}</span>
    </div>
  );
}
