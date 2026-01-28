import NotificationCenter from "../page";

export default function NotificationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <NotificationCenter id={params.id} />;
}
