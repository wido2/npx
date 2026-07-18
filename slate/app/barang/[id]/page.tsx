import { BarangDetail } from "@/components/barang-detail"

export default async function BarangDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <BarangDetail barangId={id} />
}
