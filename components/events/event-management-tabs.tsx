"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, LayoutDashboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

type TicketChartItem = {
  type: string;
  total: number;
  sold: number;
  revenue: number;
};

type EventManagementTabsProps = {
  children: React.ReactNode;
  ticketBreakdown: TicketChartItem[];
  registrationsConfirmed: number;
  registrationsTotal: number;
  ticketsSold: number;
  networkingAccepted: number;
  networkingTotal: number;
  sponsorsCount: number;
  exposantsCount: number;
  sessionsCount: number;
  roomsCount: number;
  totalRevenue: number;
};

const capacityConfig = {
  sold: {
    label: "Sold",
    color: "var(--chart-1)",
  },
  remaining: {
    label: "Remaining",
    color: "var(--chart-2)",
  },
};

const revenueConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-3)",
  },
};

const ecosystemConfig = {
  value: {
    label: "Count",
    color: "var(--chart-4)",
  },
};

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export function EventManagementTabs({
  children,
  ticketBreakdown,
  registrationsConfirmed,
  registrationsTotal,
  ticketsSold,
  networkingAccepted,
  networkingTotal,
  sponsorsCount,
  exposantsCount,
  sessionsCount,
  roomsCount,
  totalRevenue,
}: EventManagementTabsProps) {
  const capacityData = ticketBreakdown.map((item) => ({
    name: item.type,
    sold: item.sold,
    remaining: Math.max(item.total - item.sold, 0),
  }));

  const revenueData = ticketBreakdown.map((item) => ({
    name: item.type,
    revenue: Number(item.revenue.toFixed(2)),
  }));

  const ecosystemData = [
    { name: "Sponsors", value: sponsorsCount },
    { name: "Exposants", value: exposantsCount },
    { name: "Sessions", value: sessionsCount },
    { name: "Rooms", value: roomsCount },
  ].filter((item) => item.value > 0);

  const funnelData = [
    {
      label: "Confirmed registrations",
      value: registrationsConfirmed,
      helper: `${registrationsConfirmed}/${registrationsTotal}`,
    },
    {
      label: "Tickets sold",
      value: ticketsSold,
      helper: `${ticketsSold} sold`,
    },
    {
      label: "Accepted networking",
      value: networkingAccepted,
      helper: `${networkingAccepted}/${networkingTotal}`,
    },
    {
      label: "Revenue",
      value: totalRevenue,
      helper: formatCurrency(totalRevenue),
    },
  ];

  return (
    <Tabs defaultValue="info" className="gap-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Management Console
          </h2>
          <p className="text-sm text-muted-foreground">
            Switch between operational details and event analytics.
          </p>
        </div>
        <TabsList variant="default" className="w-full sm:w-auto">
          <TabsTrigger value="info" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Info
          </TabsTrigger>
          <TabsTrigger value="charts" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Charts
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="info" className="space-y-6">
        {children}
      </TabsContent>

      <TabsContent value="charts" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {funnelData.map((item) => (
            <Card
              key={item.label}
              className="rounded-2xl border-border/50 bg-card/50"
            >
              <CardHeader className="pb-2">
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold">
                  {item.label === "Revenue"
                    ? formatCurrency(item.value)
                    : item.value.toLocaleString()}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                {item.helper}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Ticket Capacity Mix</CardTitle>
              <CardDescription>
                Sold versus remaining inventory by ticket type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {capacityData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No ticket data available for charts.
                </p>
              ) : (
                <ChartContainer config={capacityConfig} className="h-70 w-full">
                  <BarChart
                    data={capacityData}
                    margin={{ left: 8, right: 8, top: 8 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="sold"
                      stackId="tickets"
                      fill="var(--color-sold)"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="remaining"
                      stackId="tickets"
                      fill="var(--color-remaining)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Revenue by Ticket Type</CardTitle>
              <CardDescription>
                Revenue generated per tier from sold tickets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {revenueData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No revenue data available for charts.
                </p>
              ) : (
                <ChartContainer config={revenueConfig} className="h-70 w-full">
                  <BarChart
                    data={revenueData}
                    margin={{ left: 8, right: 8, top: 8 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${Number(value).toFixed(0)}`}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Bar
                      dataKey="revenue"
                      fill="var(--color-revenue)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Conversion Snapshot</CardTitle>
              <CardDescription>
                Operational pipeline from registration to paid attendance.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-background/30 p-4">
                <p className="text-xs text-muted-foreground">Registrations</p>
                <p className="mt-2 text-2xl font-semibold">
                  {registrationsConfirmed}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {registrationsTotal} total requests
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/30 p-4">
                <p className="text-xs text-muted-foreground">Paid attendance</p>
                <p className="mt-2 text-2xl font-semibold">{ticketsSold}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tickets sold across all tiers
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/30 p-4">
                <p className="text-xs text-muted-foreground">Networking</p>
                <p className="mt-2 text-2xl font-semibold">
                  {networkingAccepted}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accepted connections
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle>Ecosystem Mix</CardTitle>
              <CardDescription>
                Supporting entities contributing to the event footprint.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ecosystemData.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No ecosystem data available for charts.
                </p>
              ) : (
                <ChartContainer
                  config={ecosystemConfig}
                  className="h-70 w-full"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" />}
                    />
                    <Pie
                      data={ecosystemData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {ecosystemData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              )}
              <div className="mt-4 grid gap-2 text-sm">
                {ecosystemData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 px-3 py-2"
                  >
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
