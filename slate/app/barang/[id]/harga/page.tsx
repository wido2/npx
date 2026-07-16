import { BarangHargaHistory } from "@/components/barang-harga-history"

export default async function BarangHargaPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <BarangHargaHistory barangId={id} />
}
