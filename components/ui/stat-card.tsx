"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down";
  change?: number;
  data?: number[];
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, change, data, className }: StatCardProps) {
  const chartData = data?.map((val, i) => ({ value: val, index: i })) || [];
  
  return (
    <Card className={cn("overflow-hidden rounded-2xl border-border/50 bg-card/50 shadow-sm backdrop-blur", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            
            {(trend || change !== undefined) && (
              <div className="flex items-center gap-1 text-xs">
                {trend === "up" ? (
                  <ArrowUpIcon className="h-3 w-3 text-emerald-500" />
                ) : trend === "down" ? (
                  <ArrowDownIcon className="h-3 w-3 text-destructive" />
                ) : null}
                <span
                  className={cn(
                    "font-medium",
                    trend === "up" && "text-emerald-500",
                    trend === "down" && "text-destructive",
                  )}
                >
                  {change}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          
          {data && data.length > 0 && (
            <div className="h-10 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={trend === 'down' ? 'var(--destructive)' : 'var(--primary)'}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
