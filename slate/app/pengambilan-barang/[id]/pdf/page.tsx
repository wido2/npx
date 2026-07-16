import { PengambilanBarangPdfView } from "@/components/pengambilan-barang-pdf-view"

export default async function PBPdfPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <PengambilanBarangPdfView pbId={id} />
}
