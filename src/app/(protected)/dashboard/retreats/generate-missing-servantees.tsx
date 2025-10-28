'use client'

import { Button } from '@/components/ui/button'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { useState } from 'react'
import { b64font } from '@/lib/fonts/amiri-font'

type Props = {
  retreatId: string
  retreatName: string
}

export default function GenerateMissingServantees({ retreatId, retreatName }: Props) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    try {
      setLoading(true)

      // 1️⃣ Fetch *all* servantees (not paginated)
      let page = 1
      const limit = 100
      let allServantees: any[] = []
      let hasMore = true

      while (hasMore) {
        const data: any = await apiFetch(`/servantees?page=${page}&limit=${limit}`)
        if (!data.data || data.data.length === 0) break

        allServantees = [...allServantees, ...data.data]
        hasMore = data.pages && page < data.pages
        page++
      }

      // 2️⃣ Fetch the selected retreat
      const retreat: any = await apiFetch(`/retreats/${retreatId}`)
      const attendeeIds = (retreat.attendees || []).map((a: any) =>
        typeof a === 'string' ? a : a._id
      )

      // 3️⃣ Filter out attendees
      const missing = allServantees.filter((s) => !attendeeIds.includes(s._id))

      if (missing.length === 0) {
        toast.info('كل المخدومين مشاركين في الخلوة 🎉')
        return
      }

      // 4️⃣ Initialize PDF with Arabic font and RTL support
      const doc = new jsPDF({ orientation: 'p', unit: 'pt' })
      doc.addFileToVFS('Amiri-Regular.ttf', b64font)
      doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal')
      doc.setFont('Amiri')
        doc.setFontSize(16)

      // 5️⃣ Title (right-aligned, Arabic)
      doc.text(`قائمة المخدومين غير المشاركين في خلوة ${retreatName}`, 550, 60, {
        align: 'right',
      })

      // 6️⃣ Prepare table data
// 6️⃣ Prepare table data (3 names per row)
const names = missing.map((s) => s.name || '-')
const rows = []
for (let i = 0; i < names.length; i += 3) {
  rows.push([names[i], names[i + 1] || '', names[i + 2] || ''])
}

      // 7️⃣ Generate Arabic table
      autoTable(doc, {
        startY: 90,
        body: rows,
        styles: {
          font: 'Amiri',
          fontStyle: 'normal',
          halign: 'right',
          textColor: [0, 0, 0],
          cellWidth: 'wrap',
        },
       
        margin: { right: 40, left: 40 },
      })

      // 8️⃣ Save PDF
      doc.save(`المخدومين_غير_المشاركين_${retreatName}.pdf`)
      toast.success('تم إنشاء ملف PDF بنجاح ✅')
    } catch (err: any) {
      console.error(err)
      toast.error('حدث خطأ أثناء إنشاء الملف')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading}>
      {loading ? 'جارٍ الإنشاء...' : 'تصدير غير المشاركين PDF'}
    </Button>
  )
}
