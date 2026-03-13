"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import {
  CalendarIcon,
  CreditCardIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type DashboardData = {
  kpiData: {
    totalEvents: number;
    ticketsSold: number;
    totalRevenue: number;
    attendanceRate: number;
  };
  monthlyEventData: Array<{ month: string; revenue: number; tickets: number }>;
  ticketTypeData: Array<{ type: string; count: number; fill: string }>;
  recentRegistrations: Array<{
    id: string;
    status: string;
    userName: string;
    userEmail: string;
    eventTitle: string;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    dateStart: string;
    location: string;
    ticketsSold: number;
    attendeesCount: number;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = await response.json();
      setData(payload);
    };

    load();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[40vh] text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground">
            Platform activities and overall performance metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={data.kpiData.totalEvents.toLocaleString()}
          icon={CalendarIcon}
          trend="up"
          change={0}
          data={[2, 4, 3, 5, 4, 6]}
        />
        <StatCard
          title="Tickets Sold"
          value={data.kpiData.ticketsSold.toLocaleString()}
          icon={TicketIcon}
          trend="up"
          change={0}
          data={[120, 300, 250, 400, 380, 500]}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.kpiData.totalRevenue)}
          icon={CreditCardIcon}
          trend="up"
          change={0}
          data={[12000, 30000, 25000, 40000, 38000, 50000]}
        />
        <StatCard
          title="Attendance Rate"
          value={`${data.kpiData.attendanceRate}%`}
          icon={UsersIcon}
          trend="up"
          change={0}
          data={[80, 82, 79, 85, 83, 78]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-full md:col-span-4 xl:col-span-5 rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Revenue & Tickets Overview</CardTitle>
            <CardDescription>
              Monthly breakdown of platform revenue and ticket sales
            </CardDescription>
          </CardHeader>
          <CardContent className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.monthlyEventData}
                margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  name="Revenue"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  name="Tickets"
                  dataKey="tickets"
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="col-span-full md:col-span-3 xl:col-span-2 rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Ticket Types</CardTitle>
            <CardDescription>Distribution of sold tickets</CardDescription>
          </CardHeader>
          <CardContent className="h-87.5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.ticketTypeData}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="type"
                  stroke="none"
                >
                  {data.ticketTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                  }}
                  itemStyle={{ color: "var(--foreground)" }}
                />
                <Legend
                  iconType="circle"
                  layout="horizontal"
                  verticalAlign="bottom"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Recent Registrations Table/List */}
        <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Recent Registrations</CardTitle>
            <CardDescription>Latest attendees joining events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.recentRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {reg.userName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {reg.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {reg.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-medium">{reg.eventTitle}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase font-semibold border-none",
                        reg.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : reg.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-destructive/10 text-destructive",
                      )}
                    >
                      {reg.status.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events starting soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-accent text-accent-foreground min-w-12 h-12 border border-border/50">
                      <span className="text-xs font-medium uppercase text-muted-foreground leading-none mb-1">
                        {format(new Date(event.dateStart), "MMM")}
                      </span>
                      <span className="text-lg font-bold leading-none">
                        {format(new Date(event.dateStart), "dd")}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none truncate max-w-50">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right space-y-1">
                      <p className="text-xs text-muted-foreground">Tickets</p>
                      <p className="text-sm font-medium">
                        {event.ticketsSold}/
                        {event.attendeesCount > 0 ? event.attendeesCount : "∞"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
