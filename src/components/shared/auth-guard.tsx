"use client";

import { useEnterpriseStore, ROLE_LABELS } from "@/stores/enterprise-store";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LogIn } from "lucide-react";
import type { ReactNode } from "react";

type AuthGuardProps = {
  permission: string;
  children: ReactNode;
};

export function AuthGuard({ permission, children }: AuthGuardProps) {
  const currentUser = useEnterpriseStore((s) => s.currentUser);
  const hasPermission = useEnterpriseStore((s) => s.hasPermission);
  const setCurrentUser = useEnterpriseStore((s) => s.setCurrentUser);
  const users = useEnterpriseStore((s) => s.users);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <LogIn className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">ログインが必要です</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            この機能を利用するにはログインしてください
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              size="sm"
              onClick={() => setCurrentUser(user)}
              className="gap-1.5"
            >
              <span className="text-xs">
                {user.name} ({ROLE_LABELS[user.role]})
              </span>
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          デモモード: 上のユーザーを選択してログインできます
        </p>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">アクセス権限がありません</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            この操作には「{permission}」権限が必要です。
            現在のロール: {ROLE_LABELS[currentUser.role]}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentUser(null)}>
          別のユーザーでログイン
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
