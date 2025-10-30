'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { format } from 'date-fns'
import { toast } from 'sonner'

// Export libs
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { b64font } from '@/lib/fonts/amiri-font'

interface Retreat {
  _id: string
  name: string
  startDate: string
  endDate: string
  attendees: string[]
}

interface Servantee {
  _id: string
  name: string
  phone: string
}

function getAttendeeIds(retreat: Retreat): string[] {
  if (!retreat?.attendees) return []
  return (retreat.attendees as any[]).map(a => (typeof a === 'string' ? a : a._id))
}

export default function SearchPage() {
  const [retreats, setRetreats] = useState<Retreat[]>([])
  const [servantees, setServantees] = useState<Servantee[]>([])
  const [startRetreatId, setStartRetreatId] = useState<string | null>(null)
  const [endRetreatId, setEndRetreatId] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'attended' | 'notAttended'>('attended')
  const [filtered, setFiltered] = useState<Servantee[]>([])

  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadingExcel, setLoadingExcel] = useState(false)

  useEffect(() => {
    fetchRetreats()
    fetchServantees()
  }, [])

  async function fetchRetreats() {
    const res: any = await apiFetch('/retreats')
    const sorted = res.data.sort((a: Retreat, b: Retreat) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    setRetreats(sorted)
  }

  async function fetchServantees() {
    const res: any = await apiFetch('/servantees')
    setServantees(res.data)
  }

  function handleSearch() {
    if (!startRetreatId || !endRetreatId) {
      setFiltered([])
      return
    }

    const startIndex = retreats.findIndex(r => r._id === startRetreatId)
    const endIndex = retreats.findIndex(r => r._id === endRetreatId)

    if (startIndex === -1 || endIndex === -1) {
      setFiltered([])
      return
    }

    const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex]
    const range = retreats.slice(from, to + 1)

    const allAttendeeIds = new Set<string>()
    range.forEach(r => getAttendeeIds(r).forEach(id => allAttendeeIds.add(id)))

    const result =
      filterType === 'attended'
        ? servantees.filter(s => allAttendeeIds.has(s._id))
        : servantees.filter(s => !allAttendeeIds.has(s._id))

    setFiltered(result)
  }

  const handleExportPDF = async () => {
    try {
      if (filtered.length === 0) {
        toast.info("لا يوجد بيانات للتصدير")
        return
      }

      setLoadingPdf(true)

      const doc = new jsPDF({ orientation: "p", unit: "pt" })
      doc.addFileToVFS("Amiri-Regular.ttf", b64font)
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal")
      doc.setFont("Amiri")
      doc.setFontSize(16)

      doc.text("نتائج البحث عن المخدومين", 540, 40, { align: "right" })

      const rows = filtered.map(s => [ s.phone, s.name])

      autoTable(doc, {
        body: rows,
        styles: { font: "Amiri", halign: "right" },
        margin: { right: 40, left: 40 },
        startY: 70
      })

      doc.save(`نتائج_البحث.pdf`)
      toast.success("تم إنشاء ملف PDF بنجاح ✅")
    } catch {
      toast.error("حدث خطأ أثناء إنشاء ملف PDF")
    } finally {
      setLoadingPdf(false)
    }
  }

  const handleExportExcel = () => {
    try {
      if (filtered.length === 0) {
        toast.info("لا يوجد بيانات للتصدير")
        return
      }

      setLoadingExcel(true)

      const data = filtered.map(s => ({
        الموبايل: s.phone,
        الاسم: s.name
      }))

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Results")
      XLSX.writeFile(workbook, "نتائج_البحث.xlsx")
      toast.success("تم إنشاء ملف Excel بنجاح ✅")
    } catch {
      toast.error("حدث خطأ أثناء إنشاء ملف Excel")
    } finally {
      setLoadingExcel(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-right">بحث الحضور في الخلوات</h1>

      <Card className="p-4 flex flex-row items-start justify-start gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-right">من خلوة</label>
          <Select onValueChange={setStartRetreatId}>
            <SelectTrigger><SelectValue placeholder="اختر البداية" /></SelectTrigger>
            <SelectContent>
              {retreats.map(r => (
                <SelectItem key={r._id} value={r._id}>
                  {r.name} ({format(new Date(r.startDate), "yyyy-MM-dd")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-right">إلى خلوة</label>
          <Select onValueChange={setEndRetreatId}>
            <SelectTrigger><SelectValue placeholder="اختر النهاية" /></SelectTrigger>
            <SelectContent>
              {retreats.map(r => (
                <SelectItem key={r._id} value={r._id}>
                  {r.name} ({format(new Date(r.startDate), "yyyy-MM-dd")})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1 text-right">نوع البحث</label>
          <Select value={filterType} onValueChange={v => setFilterType(v as "attended" | "notAttended")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="attended">حضر</SelectItem>
              <SelectItem value="notAttended">لم يحضر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="self-end" onClick={handleSearch}>
          بحث
        </Button>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleExportPDF} disabled={loadingPdf}>
          {loadingPdf ? "جارٍ إنشاء PDF..." : "تصدير PDF"}
        </Button>
        <Button onClick={handleExportExcel} disabled={loadingExcel}>
          {loadingExcel ? "جارٍ إنشاء Excel..." : "تصدير Excel"}
        </Button>
      </div>

      <Card className="p-4 shadow-sm overflow-x-auto">
        <Table className="min-w-full text-right">
          <TableCaption>
            {filtered.length === 0 ? 'لا يوجد نتائج' : `عدد النتائج: ${filtered.length}`}
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className='text-right'>الاسم</TableHead>
              <TableHead className='text-right' >الموبايل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s._id}>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
