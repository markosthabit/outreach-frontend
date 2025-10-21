'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Users, Notebook, CalendarDays } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          سلام ونعمة 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          نظرة سريعة على نشاط الخدمة
        </p>
      </section>

      {/* Summary Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          className="hover:bg-accent/30 transition cursor-pointer"
          onClick={() => router.push('/servantees')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المخدومين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">مخدوم نشط</p>
          </CardContent>
        </Card>

        <Card
          className="hover:bg-accent/30 transition cursor-pointer"
          onClick={() => router.push('/retreats')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الخلوات</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">خلوات قادمة</p>
          </CardContent>
        </Card>

        <Card
          className="hover:bg-accent/30 transition cursor-pointer"
          onClick={() => router.push('/notes')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملاحظات</CardTitle>
            <Notebook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
            <p className="text-xs text-muted-foreground">ملاحظات مسجلة</p>
          </CardContent>
        </Card>
      </section>

      {/* Call-to-Action */}
      <section className="mt-8">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Ready to serve?</h2>
            <p className="text-sm text-muted-foreground">
              Start by adding new servantees, retreats, or notes.
            </p>
          </div>
          <Button onClick={() => router.push('/servantees')}>Add Servantee</Button>
        </Card>
      </section>
    </div>
  )
}
