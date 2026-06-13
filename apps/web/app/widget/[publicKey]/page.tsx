import { WidgetChat } from '@/components/widget-chat';

export default async function WidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicKey: string }>;
  searchParams: Promise<{ o?: string }>;
}) {
  const { publicKey } = await params;
  const { o } = await searchParams;
  return <WidgetChat publicKey={publicKey} host={o ?? null} />;
}
