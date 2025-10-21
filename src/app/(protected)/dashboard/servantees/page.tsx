'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { AddServanteeDialog } from './add-servantee-dialog'
import { EditServanteeDialog } from './edit-servantee-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Servantee {
  _id: string
  name: string
  phone: string
  church: string
  education: string
  work: string
  birthDate: string
  isActive: boolean
  notes: string[]
}

export default function ServanteesPage() {
  const [servantees, setServantees] = useState<Servantee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServantees = async () => {
    try {
      setLoading(true)
      const data: any = await apiFetch('/servantees')
      setServantees(data)
    } catch (err: any) {
      setError(err.message || 'Error fetching data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/servantees/${id}`, { method: 'DELETE' })
      toast.success('تم حذف المخدوم بنجاح')
      fetchServantees()
    } catch (err: any) {
      console.error(err)
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  useEffect(() => {
    fetchServantees()
  }, [])

  if (loading) return <p className="p-4">جاري التحميل...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">المخدومين</h1>
        <AddServanteeDialog onAdded={fetchServantees} />
      </div>

      <Card className="p-4 shadow-sm overflow-x-auto">
        <Table className="min-w-full text-right border-collapse">
          <TableCaption>
            {servantees.length === 0 ? 'لا يوجد مخدومين' : `الإجمالي: ${servantees.length}`}
          </TableCaption>

          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">الإسم</TableHead>
              <TableHead className="text-right">التليفون</TableHead>
              <TableHead className="text-right">الكنيسة</TableHead>
              <TableHead className="text-right">الدراسة</TableHead>
              <TableHead className="text-right">العمل</TableHead>
              <TableHead className="text-right">تاريخ الميلاد</TableHead>
              <TableHead className="text-right">الملاحظات</TableHead>
              <TableHead className="text-right w-[100px]">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {servantees.map((s) => (
              <TableRow key={s._id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.phone || '-'}</TableCell>
                <TableCell>{s.church || '-'}</TableCell>
                <TableCell>{s.education || '-'}</TableCell>
                <TableCell>{s.work || '-'}</TableCell>
                <TableCell>
                  {s.birthDate ? format(new Date(s.birthDate), 'yyyy-MM-dd') : '-'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {s.notes?.length ? s.notes.join(', ') : '-'}
                </TableCell>

                <TableCell className="flex gap-2 justify-end">
                  <EditServanteeDialog servantee={s} onUpdated={fetchServantees} />
                  {/* <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(s._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button> */}
                  <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">حذف</Button>
  </AlertDialogTrigger>
  <AlertDialogContent dir="rtl" className="text-right">

    <AlertDialogHeader>
      <AlertDialogTitle className='text-right'>حذف مخدوم</AlertDialogTitle>
      <AlertDialogDescription className='text-right'>
        هل انت متأكد انك ترغب في حذف هذا المخدوم؟ لن يمكنك استرجاع البيانات مرة أخرى.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>الغاء</AlertDialogCancel>
      <AlertDialogAction
        onClick={() => handleDelete(s._id)}
        className="bg-red-600 hover:bg-red-700"
      >
        حذف
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>

</AlertDialog>

                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
