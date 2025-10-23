'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'

export interface EntityField {
  name: string
  label: string
  type?: 'text' | 'textarea' | 'number' | 'date'
  placeholder?: string
  required?: boolean
}

interface EntityDialogProps {
  title: string
  endpoint: string
  fields: EntityField[]
  mode: 'add' | 'edit'
  initialData?: Record<string, any>
  onSuccess?: () => void
  trigger?: React.ReactNode
}

export function EntityDialog({
  title,
  endpoint,
  fields,
  mode,
  initialData = {},
  onSuccess,
  trigger
}: EntityDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState(initialData)
  const [loading, setLoading] = useState(false)

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (mode === 'add') {
        await apiFetch(`/${endpoint}`, { method: 'POST', body: formData })
        toast.success('تمت الإضافة بنجاح ✅')
      } else {
        await apiFetch(`/${endpoint}/${initialData._id}`, { method: 'PUT', body: formData })
        toast.success('تم التحديث بنجاح ✅')
      }
      setOpen(false)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ ❌')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={mode === 'add' ? 'default' : 'outline'}>
            {mode === 'add' ? '➕ إضافة' : '✏️ تعديل'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.name} className="space-y-2">
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.type === 'textarea' ? (
                <Textarea
                  id={f.name}
                  placeholder={f.placeholder}
                  required={f.required}
                  value={formData[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              ) : (
                <Input
                  id={f.name}
                  type={f.type || 'text'}
                  placeholder={f.placeholder}
                  required={f.required}
                  value={formData[f.name] || ''}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'جاري الحفظ...' : mode === 'add' ? 'حفظ' : 'تحديث'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
