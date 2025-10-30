'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { apiFetch } from '@/lib/api'
import { format } from 'date-fns'

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

  useEffect(() => {
    fetchRetreats()
    fetchServantees()
  }, [])

  async function fetchRetreats() {
    const res: any = await apiFetch('/retreats')
    // sort by startDate to make range selection meaningful
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

    // find the range of retreats between start and end (inclusive)
    const startIndex = retreats.findIndex(r => r._id === startRetreatId)
    const endIndex = retreats.findIndex(r => r._id === endRetreatId)

    if (startIndex === -1 || endIndex === -1) {
      setFiltered([])
      return
    }

    const [from, to] = startIndex <= endIndex ? [startIndex, endIndex] : [endIndex, startIndex]
    const range = retreats.slice(from, to + 1)

    // gather all attendee IDs across the range
    const allAttendeeIds = new Set<string>()
    range.forEach(r => getAttendeeIds(r).forEach(id => allAttendeeIds.add(id)))

    // filter servantees
    const result =
      filterType === 'attended'
        ? servantees.filter(s => allAttendeeIds.has(s._id))
        : servantees.filter(s => !allAttendeeIds.has(s._id))

    setFiltered(result)
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



      <Card className="p-4 shadow-sm overflow-x-auto">
        <Table className="min-w-full text-right">
          <TableCaption>
            {filtered.length === 0 ? 'لا يوجد نتائج' : `عدد النتائج: ${filtered.length}`}
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>الاسم</TableHead>
              <TableHead>الموبايل</TableHead>
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
