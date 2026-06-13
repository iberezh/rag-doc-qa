'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { logout, me } from '@/lib/auth';
import type { Profile } from '@/lib/types';

export function AccountMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;
    void me().then((found) => {
      if (!active) return;
      if (!found) {
        router.push('/login');
        return;
      }
      setProfile(found);
    });
    return () => {
      active = false;
    };
  }, [router]);

  const signOut = async (): Promise<void> => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      {profile ? (
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {profile.account.name} · {profile.account.plan}
        </span>
      ) : null}
      <Button variant="ghost" size="sm" onClick={() => void signOut()}>
        Log out
      </Button>
    </div>
  );
}
