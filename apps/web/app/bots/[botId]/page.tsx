import { BotWorkspace } from '@/components/bot-workspace';

export default async function BotPage({ params }: { params: Promise<{ botId: string }> }) {
  const { botId } = await params;
  return <BotWorkspace botId={botId} />;
}
