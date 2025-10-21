'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { apiFetch } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from "@/components/ui/alert-dialog"

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

// Debounce hook
export function useDebounce<T>(value: T, delay = 500) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

export default function ServanteesPage() {
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [servantees, setServantees] = useState<Servantee[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [hasMore, setHasMore] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  // Focus the input only on initial mount
  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  // Fetch data when page or debouncedSearchTerm changes
  const fetchServantees = useCallback(async (pageNumber = page, search = debouncedSearchTerm) => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pageNumber.toString(),
        limit: limit.toString(),
        ...(search ? { search } : {})
      })

      const data: any = await apiFetch(`/servantees?${params.toString()}`)
      setServantees(data.data || data)
      setHasMore(!data.pages || pageNumber < data.pages)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }, [page, limit, debouncedSearchTerm])

  useEffect(() => {
    fetchServantees(page, debouncedSearchTerm)
  }, [page, debouncedSearchTerm, fetchServantees])

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearchTerm])

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/servantees/${id}`, { method: 'DELETE' })
      toast.success('تم حذف المخدوم بنجاح')
      fetchServantees(page, debouncedSearchTerm)
    } catch (err: any) {
      console.error(err)
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  if (loading) return <p className="p-4">جاري التحميل...</p>
  if (error) return <p className="p-4 text-red-500">{error}</p>

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">المخدومين</h1>
        <AddServanteeDialog onAdded={() => fetchServantees(1, debouncedSearchTerm)} />
      </div>

      {/* Search */}
      <div className="flex gap-3 sm:w-1/2">
        <Input
        type="search"  
          ref={searchInputRef}
          placeholder="🔍 ابحث بالاسم أو التليفون أو الكنيسة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card className="p-4 shadow-sm overflow-x-auto">
        <Table className="min-w-full text-right border-collapse">
          <TableCaption>
            {servantees.length === 0
              ? 'لا يوجد مخدومين'
              : `عدد النتائج: ${servantees.length}`}
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
                  <EditServanteeDialog servantee={s} onUpdated={() => fetchServantees(page, debouncedSearchTerm)} />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">حذف</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl" className="text-right">
                      <AlertDialogHeader>
                        <AlertDialogTitle className='text-right'>حذف مخدوم</AlertDialogTitle>
                        <AlertDialogDescription className='text-right'>
                          هل انت متأكد انك ترغب في حذف هذا المخدوم؟ لن يمكنك استرجاع البيانات مرة أخرى.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
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

      {/* Pagination Controls */}
      <div className="flex justify-center gap-4 mt-4">
        <Button
          type='button'
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          ⬅️ السابق
        </Button>
        <span className="self-center font-medium">الصفحة {page}</span>
        <Button
          type='button'
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={!hasMore}
        >
          التالي ➡️
        </Button>
      </div>
    </div>
  )
}
