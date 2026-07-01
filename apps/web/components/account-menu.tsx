'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { logout, me } from '@/lib/auth';
import type { Profile } from '@/lib/types';
import { UpgradeModal } from './upgrade-modal';

export function AccountMenu() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

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
          {profile.account.name} ·{' '}
          <button
            type="button"
            onClick={() => setShowUpgrade(true)}
            className="underline decoration-dotted underline-offset-2 transition-colors hover:text-foreground"
            title="Manage plan"
          >
            {profile.account.plan}
          </button>
        </span>
      ) : null}
      <Button variant="ghost" size="sm" onClick={() => void signOut()}>
        Log out
      </Button>
      {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
    </div>
  );
}
