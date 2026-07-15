"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

const PRESET_COLORS = [
  { label: "Ungu", value: "#7c7bad" },
  { label: "Navy", value: "#2c3e50" },
  { label: "Biru", value: "#3498db" },
  { label: "Hijau", value: "#27ae60" },
  { label: "Teal", value: "#16a085" },
  { label: "Biru Dongker", value: "#1a5276" },
  { label: "Oranye", value: "#e67e22" },
  { label: "Abu Tua", value: "#34495e" },
  { label: "Hitam", value: "#1a1a2e" },
  { label: "Biru Muda", value: "#5dade2" },
]

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="w-full justify-between gap-2 font-mono"
          >
            <span className="flex items-center gap-2">
              <span
                className="size-4 shrink-0 rounded border"
                style={{ backgroundColor: value }}
              />
              {value}
            </span>
          </Button>
        }
      />
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                className="flex flex-col items-center gap-1"
                onClick={() => {
                  onChange(c.value)
                  setOpen(false)
                }}
              >
                <span
                  className="size-7 rounded-md border ring-offset-background transition-transform hover:scale-110"
                  style={{ backgroundColor: c.value }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="size-6 shrink-0 rounded border"
              style={{ backgroundColor: value }}
            />
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-8 font-mono text-xs"
              placeholder="#hex"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
