'use client'

import { useEffect, useState } from 'react'
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import isBetween from "dayjs/plugin/isBetween"
dayjs.extend(isBetween)

export function SectionCards() {
  const [stats, setStats] = useState({
    newServantees: 0,
    newServanteesChange: 0,
    servants: 0,
    retreats: [] as any[],
    nextRetreat: null as null | { title: string; startDate: string },
    loading: true,
  })

  async function fetchDashboardStats() {
    try {
      setStats((s) => ({ ...s, loading: true }))

      // Fetch in parallel for speed
      const [servantees, users, retreats] = await Promise.all([
        apiFetch<any[]>('/servantees'),
        apiFetch<any[]>('/users'),
        apiFetch<any[]>('/retreats'),
      ])

      // ---- Servantees logic ----
      const thisMonth = dayjs().startOf('month')
      const lastMonth = dayjs().subtract(1, 'month').startOf('month')

      const servanteesThisMonth = servantees.filter((s: any) =>
        dayjs(s.createdAt).isAfter(thisMonth)
      ).length

      const servanteesLastMonth = servantees.filter((s: any) =>
        dayjs(s.createdAt).isBetween(lastMonth, thisMonth)
      ).length

      const change =
        servanteesLastMonth === 0
          ? 100
          : ((servanteesThisMonth - servanteesLastMonth) /
              servanteesLastMonth) *
            100

      // ---- Servants logic ----
      const totalServants = users.length

      // ---- Retreats logic ----
      const futureRetreats = retreats.filter((r: any) =>
        dayjs(r.startDate).isAfter(dayjs())
      )

      const nextRetreat =
        futureRetreats.length > 0
          ? futureRetreats.sort(
              (a: any, b: any) =>
                dayjs(a.startDate).unix() - dayjs(b.startDate).unix()
            )[0]
          : null

      setStats({
        newServantees: servanteesThisMonth,
        newServanteesChange: Math.round(change),
        servants: totalServants,
        retreats,
        nextRetreat,
        loading: false,
      })
    } catch (err) {
      console.error(err)
      toast.error('حدث خطأ أثناء تحميل البيانات')
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const {
    newServantees,
    newServanteesChange,
    servants,
    nextRetreat,
    loading,
  } = stats

  if (loading) return <div className="p-6 text-center">جاري التحميل...</div>

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* المخدومين الجدد */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>المخدومين الجدد</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {newServantees}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {newServanteesChange >= 0 ? (
                <>
                  <IconTrendingUp className="ml-1" />
                  +{newServanteesChange}%
                </>
              ) : (
                <>
                  <IconTrendingDown className="ml-1" />
                  {newServanteesChange}%
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {newServanteesChange >= 0 ? 'زيادة هذا الشهر' : 'انخفاض هذا الشهر'}
          </div>
          <div className="text-muted-foreground">
            مقارنةً بالشهر الماضي
          </div>
        </CardFooter>
      </Card>

      {/* الخدام */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>الخدام</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {servants}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp className="ml-1" />
              ثابت
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">عدد الخدام الكلي</div>
          <div className="text-muted-foreground">
            يشمل المسؤولين والخدام العاديين
          </div>
        </CardFooter>
      </Card>

      {/* الخلوة القادمة */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>الخلوة القادمة</CardDescription>
          <CardTitle className="text-2xl font-semibold @[350px]/card:text-3xl">
            {nextRetreat
              ? dayjs(nextRetreat.startDate).format('D/M/YYYY')
              : 'لا يوجد'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {nextRetreat ? 'جاهزة' : 'لا يوجد'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {nextRetreat ? nextRetreat.title : 'لا يوجد خلوات قادمة'}
          </div>
          <div className="text-muted-foreground">
            {nextRetreat ? 'الخلوة القادمة' : ''}
          </div>
        </CardFooter>
      </Card>

      {/* Growth placeholder */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>معدل النمو</CardDescription>
          <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
            {newServanteesChange > 0
              ? `${newServanteesChange}%`
              : '0%'}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {newServanteesChange > 0 ? 'تحسن' : 'ثابت'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium">
            {newServanteesChange > 0
              ? 'زيادة في عدد المخدومين'
              : 'استقرار في العدد'}
          </div>
          <div className="text-muted-foreground">
            مقارنة بالشهر السابق
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
