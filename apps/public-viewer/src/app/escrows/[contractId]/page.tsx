import { TransparencyEscrowDetailView } from "../../../features/transparency/views/TransparencyEscrowDetailView";

type PageProps = {
  params: Promise<{ contractId: string }>;
};

export default async function EscrowDetailPage({ params }: PageProps) {
  const { contractId } = await params;
  return <TransparencyEscrowDetailView contractId={contractId} />;
}
