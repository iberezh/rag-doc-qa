import type { Bot, Plan } from '@prisma/client';
import { limitsFor } from '../billing/plans';

export interface PublicBotConfig {
  name: string;
  greeting: string;
  color: string;
  launcherIcon: string;
  iconColor: string;
  // Pre-rendered SVG when the launcher is a Solar icon; null for a plain emoji.
  launcherSvg: string | null;
  showBadge: boolean;
}

// Public display config (no secrets). The "Powered by" badge can only be hidden on a paid plan.
export function toPublicBotConfig(bot: Bot, plan: Plan, launcherSvg: string | null): PublicBotConfig {
  return {
    name: bot.name,
    greeting: bot.greeting,
    color: bot.color,
    launcherIcon: bot.launcherIcon,
    iconColor: bot.iconColor,
    launcherSvg,
    showBadge: limitsFor(plan).badgeRemoval ? bot.showBadge : true,
  };
}
