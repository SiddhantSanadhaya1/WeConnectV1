"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useAuthSession, type AuthSession, type LoginRole } from "./session";

type AuthGateProps = {
  allowed: LoginRole[];
  children: ReactNode | ((session: AuthSession) => ReactNode);
};

export default function AuthGate({ allowed, children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useAuthSession();
  const [checked, setChecked] = useState(false);
  const allowedKey = allowed.join("|");

  useEffect(() => {
    const allowedRoles = allowedKey.split("|");
    window.setTimeout(() => setChecked(true), 0);
    if (!session || (session.role !== "admin" && !allowedRoles.includes(session.role))) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [allowedKey, pathname, router, session]);

  if (!checked) {
    return (
      <div className="app-shell grid min-h-screen place-items-center">
        <p className="text-sm text-[color:var(--muted)]">Checking access...</p>
      </div>
    );
  }

  if (!session || (session.role !== "admin" && !allowed.includes(session.role))) {
    return null;
  }

  return <>{typeof children === "function" ? children(session) : children}</>;
}
