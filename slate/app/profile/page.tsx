"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { getProfile, updateProfile, type User } from "@/lib/user-api"
import { isAuthenticated } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "", email: "", phone: "", bio: "", avatar: "",
    facebook: "", instagram: "", twitter: "", linkedin: "",
    whatsapp: "", telegram: "", tiktok: "", youtube: "", github: "",
  })

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); return }
    setLoading(true)
    getProfile()
      .then((user) => {
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          avatar: user.avatar || "",
          facebook: user.facebook || "",
          instagram: user.instagram || "",
          twitter: user.twitter || "",
          linkedin: user.linkedin || "",
          whatsapp: user.whatsapp || "",
          telegram: user.telegram || "",
          tiktok: user.tiktok || "",
          youtube: user.youtube || "",
          github: user.github || "",
        })
      })
      .catch(() => { router.push("/") })
      .finally(() => setLoading(false))
  }, [router])

  async function handleSave() {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success("Profile updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>

  return (
    <DashboardLayout>
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-10" />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-10" />
            </Field>
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-10" />
            </Field>
            <Field>
              <FieldLabel htmlFor="avatar">Avatar URL</FieldLabel>
              <Input id="avatar" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className="h-10" placeholder="https://..." />
            </Field>
          </FieldGroup>
          <Field className="mt-4">
            <FieldLabel htmlFor="bio">Bio</FieldLabel>
            <Textarea id="bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="min-h-[80px]" />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Add your social media profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {([
              ["facebook", "Facebook"],
              ["instagram", "Instagram"],
              ["twitter", "Twitter / X"],
              ["linkedin", "LinkedIn"],
              ["whatsapp", "WhatsApp"],
              ["telegram", "Telegram"],
              ["tiktok", "TikTok"],
              ["youtube", "YouTube"],
              ["github", "GitHub"],
            ] as const).map(([key, label]) => (
              <Field key={key}>
                <FieldLabel htmlFor={key}>{label}</FieldLabel>
                <Input
                  id={key}
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="h-10"
                  placeholder={`${label.toLowerCase()} username or URL`}
                />
              </Field>
            ))}
          </FieldGroup>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
    </DashboardLayout>
  )
}
