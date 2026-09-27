"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axis = { stroke: "hsl(var(--muted-foreground))", fontSize: 12, tickLine: false, axisLine: false };
const tooltip = { contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }, labelStyle: { color: "hsl(var(--foreground))" } };
const money = (v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`;

export function RevenueChart({ data }: { data: { month: string; store: number; memberships: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} tickFormatter={money} width={48} />
        <Tooltip {...tooltip} formatter={(v: number) => `$${v.toLocaleString()}`} cursor={{ fill: "hsl(var(--muted))" }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="memberships" name="Memberships" stackId="a" fill="hsl(var(--primary))" />
        <Bar dataKey="store" name="Store" stackId="a" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const TIER_COLORS: Record<string, string> = { basic: "hsl(var(--muted-foreground))", standard: "hsl(var(--success))", premium: "hsl(var(--primary))", vip: "hsl(var(--warning))" };

export function TierChart({ data }: { data: { tier: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="tier" innerRadius={60} outerRadius={95} paddingAngle={3} stroke="none">
          {data.map((d) => <Cell key={d.tier} fill={TIER_COLORS[d.tier]} />)}
        </Pie>
        <Tooltip {...tooltip} />
        <Legend wrapperStyle={{ fontSize: 12, textTransform: "capitalize" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ForecastChart({ history, forecast }: { history: { month: string; total: number }[]; forecast: { projected: number; low: number; high: number } }) {
  const data = [...history.map((h) => ({ month: h.month, actual: h.total })), { month: "Next 30d", forecast: forecast.projected, band: [forecast.low, forecast.high] }];
  if (data.length > 1) (data[data.length - 2] as Record<string, unknown>).forecast = history.at(-1)?.total;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="month" {...axis} />
        <YAxis {...axis} tickFormatter={money} width={48} />
        <Tooltip {...tooltip} />
        <Area dataKey="band" name="Confidence band" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.12} />
        <Area dataKey="actual" name="Actual" stroke="hsl(var(--foreground))" fill="transparent" strokeWidth={2} />
        <Area dataKey="forecast" name="Forecast" stroke="hsl(var(--primary))" strokeDasharray="6 4" fill="transparent" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function AttendanceHeatmap({ data }: { data: { dow: number; hour: number; c: number }[] }) {
  const hours = Array.from({ length: 18 }, (_, i) => i + 5);
  const max = Math.max(1, ...data.map((d) => d.c));
  const get = (dow: number, hour: number) => data.find((d) => d.dow === dow && d.hour === hour)?.c ?? 0;
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-[10px]">
        <thead><tr><th />{hours.map((h) => <th key={h} className="font-normal text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody>
          {DAYS.map((d, dow) => (
            <tr key={d}>
              <td className="pr-2 text-muted-foreground">{d}</td>
              {hours.map((h) => {
                const c = get(dow, h);
                return <td key={h} title={`${d} ${h}:00 — ${c} check-ins`} className="h-6 min-w-6 rounded" style={{ background: c ? `hsl(var(--primary) / ${0.15 + (c / max) * 0.85})` : "hsl(var(--muted))" }} />;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
