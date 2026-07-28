import { DashboardLayout } from "@/components/dashboard-layout"
import { PengeluaranPoContent } from "@/components/pengeluaran-po-content"

export default function PengeluaranPoPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Pengeluaran PO <span className="text-muted-foreground text-sm font-normal">/ Pengeluaran purchase order per project dan client</span>
        </h1>
      </div>
      <PengeluaranPoContent />
    </DashboardLayout>
  )
}
