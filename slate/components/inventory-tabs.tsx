"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HistoryIcon, ClipboardListIcon, BarChart3Icon } from "lucide-react"
import { InventoryMutasiTable } from "./inventory-mutasi-table"
import { InventoryOpnameForm } from "./inventory-opname-form"
import { InventoryLaporanTable } from "./inventory-laporan-table"

export function InventoryTabs() {
  return (
    <Tabs defaultValue="mutasi" className="w-full">
      <TabsList>
        <TabsTrigger value="mutasi"><HistoryIcon className="size-4" /> Mutasi Stok</TabsTrigger>
        <TabsTrigger value="opname"><ClipboardListIcon className="size-4" /> Stok Opname</TabsTrigger>
        <TabsTrigger value="laporan"><BarChart3Icon className="size-4" /> Laporan Stok</TabsTrigger>
      </TabsList>
      <TabsContent value="mutasi" className="mt-6">
        <InventoryMutasiTable />
      </TabsContent>
      <TabsContent value="opname" className="mt-6">
        <InventoryOpnameForm />
      </TabsContent>
      <TabsContent value="laporan" className="mt-6">
        <InventoryLaporanTable />
      </TabsContent>
    </Tabs>
  )
}
