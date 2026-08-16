"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";

// --- 1. Component Sparkline SVG ---
function MiniSparkline({
  color,
  points,
  id,
}: {
  color: string;
  points: string;
  id: string;
}) {
  return (
    <div className="h-12 w-full mt-2">
      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sparkGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <polygon points={`0,30 ${points} 100,30`} fill={`url(#sparkGrad-${id})`} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}

// --- 2. Component Biểu đồ Tròn (Donut Chart) ---
function CustomerAcquisitionDonut() {
  return (
    <div className="flex flex-col items-center justify-between h-full py-2">
      {/* Container chứa vòng tròn SVG */}
      <div className="relative w-44 h-44 my-2 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Vòng nền chìm */}
          <path
            className="text-slate-100"
            strokeWidth="3.8"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Vòng 1: Returning Customer (65%) - Màu Xanh */}
          <path
            className="text-blue-500 transition-all duration-1000 stroke-current"
            strokeDasharray="65, 100"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          {/* Vòng 2: First Time (35%) - Màu Hồng */}
          <path
            className="text-pink-500 transition-all duration-1000 stroke-current"
            strokeDasharray="35, 100"
            strokeDashoffset="-65"
            strokeWidth="3.8"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>

        {/* Nội dung chính giữa hình tròn */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-slate-800">65%</span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
            Returning
          </span>
        </div>
      </div>

      {/* Legend Chú thích dưới biểu đồ */}
      <div className="w-full grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50/80">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-medium text-slate-500">Returning</span>
          </div>
          <span className="text-sm font-bold text-slate-700">1,528</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50/80">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="h-2 w-2 rounded-full bg-pink-500" />
            <span className="text-[11px] font-medium text-slate-500">First Time</span>
          </div>
          <span className="text-sm font-bold text-slate-700">822</span>
        </div>
      </div>
    </div>
  );
}

// Mockup Data
const stats = [
  {
    title: "Total Revenue",
    value: "$12,099",
    change: "+6.85%",
    isPositive: true,
    color: "#6366f1",
    sparkPoints: "0,20 20,10 40,25 60,12 80,18 100,5",
  },
  {
    title: "Affiliate Revenue",
    value: "$12,099",
    change: "+3.80%",
    isPositive: true,
    color: "#ec4899",
    sparkPoints: "0,10 20,22 40,15 60,25 80,12 100,28",
  },
  {
    title: "Refunds",
    value: "0.00",
    change: "N/A",
    isPositive: true,
    color: "#06b6d4",
    sparkPoints: "0,25 20,20 40,15 60,22 80,18 100,12",
  },
  {
    title: "Avg. Revenue Per User",
    value: "$28,000",
    change: "-2.07%",
    isPositive: false,
    color: "#f59e0b",
    sparkPoints: "0,12 20,18 40,10 60,28 80,15 100,22",
  },
];

const recentOrders = [
  {
    id: "#id000001",
    product: "Cloud Hosting Pro",
    image: "💻",
    quantity: 23,
    price: "$80.00",
    time: "27-08-2026 01:22:12",
    customer: "Patricia J. King",
    status: "In Transit",
  },
  {
    id: "#id000002",
    product: "VPS Basic",
    image: "🖥️",
    quantity: 12,
    price: "$180.00",
    time: "25-08-2026 21:13:56",
    customer: "Rachel J. Wicker",
    status: "Delivered",
  },
  {
    id: "#id000003",
    product: "Dedicated Server",
    image: "🗄️",
    quantity: 23,
    price: "$225.00",
    time: "24-08-2026 14:12:77",
    customer: "Michael K. Ladford",
    status: "Delivered",
  },
  {
    id: "#id000004",
    product: "Domain Name",
    image: "🌐",
    quantity: 34,
    price: "$350.00",
    time: "23-08-2026 09:10:35",
    customer: "Michael K. Ladford",
    status: "Delivered",
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 font-sans bg-slate-50/50 p-4 sm:p-6 min-h-screen">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
          E-commerce Dashboard Template
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Dashboard</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-600 font-medium">E-commerce Dashboard Template</span>
        </div>
      </div>

      {/* Metric Cards Bo Tron Góc (rounded-2xl) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col justify-between">
            <CardContent className="p-4 pb-0">
              <span className="text-xs font-medium text-slate-400">{stat.title}</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-2xl font-black text-slate-800">{stat.value}</span>
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${stat.isPositive
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-rose-600 bg-rose-50"
                    }`}
                >
                  {stat.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </span>
              </div>
            </CardContent>

            <MiniSparkline color={stat.color} points={stat.sparkPoints} id={`${idx}`} />
          </Card>
        ))}
      </div>

      {/* Section Main */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7 items-start">

        {/* Recent Orders Table */}
        <Card className="lg:col-span-5 border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800">Recent Orders</CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-600">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-slate-100">
                    <TableHead className="w-10 text-center text-xs text-slate-500 font-semibold">#</TableHead>
                    <TableHead className="w-12 text-xs text-slate-500 font-semibold">Image</TableHead>
                    <TableHead className="text-xs text-slate-500 font-semibold">Product Name</TableHead>
                    <TableHead className="text-xs text-slate-500 font-semibold">Product Id</TableHead>
                    <TableHead className="text-xs text-slate-500 font-semibold">Quantity</TableHead>
                    <TableHead className="text-xs text-slate-500 font-semibold">Price</TableHead>
                    <TableHead className="text-xs text-slate-500 font-semibold">Order Time</TableHead>
                    <TableHead className="text-xs text-slate-500 font-semibold">Customer</TableHead>
                    <TableHead className="text-xs text-slate-500 font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {recentOrders.map((order, idx) => (
                    <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/60 transition-colors text-xs">
                      <TableCell className="text-center font-medium text-slate-400">{idx + 1}</TableCell>

                      <TableCell>
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200/60 flex items-center justify-center text-sm shadow-sm">
                          {order.image}
                        </div>
                      </TableCell>

                      <TableCell className="font-semibold text-slate-700">{order.product}</TableCell>
                      <TableCell className="text-slate-400 font-mono">{order.id}</TableCell>
                      <TableCell className="text-slate-600 font-medium">{order.quantity}</TableCell>
                      <TableCell className="font-bold text-slate-800">{order.price}</TableCell>
                      <TableCell className="text-slate-400 text-[11px]">{order.time}</TableCell>
                      <TableCell className="text-slate-700 font-medium">{order.customer}</TableCell>

                      <TableCell>
                        {order.status === "Delivered" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-700 bg-emerald-50">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-amber-700 bg-amber-50">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> InTransit
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="p-3 border-t border-slate-100 flex justify-end bg-slate-50/30">
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-slate-600 border-slate-200 rounded-xl">
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer Acquisition Donut Card */}
        <Card className="lg:col-span-2 border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden flex flex-col justify-between">
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-sm font-semibold text-slate-800">Customer Acquisition</CardTitle>
          </CardHeader>

          <CardContent className="p-4 flex-1">
            <CustomerAcquisitionDonut />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}