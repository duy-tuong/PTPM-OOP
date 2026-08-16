"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

const mockOrders = [
  {
    id: "#ORD-001",
    customer: "Liam Johnson",
    email: "liam@example.com",
    avatar: "LJ",
    plan: "Cloud Hosting Pro",
    status: "Completed",
    amount: "$250.00",
    date: "24-10-2026",
  },
  {
    id: "#ORD-002",
    customer: "Olivia Smith",
    email: "olivia@example.com",
    avatar: "OS",
    plan: "VPS Basic",
    status: "Pending",
    amount: "$150.00",
    date: "24-10-2026",
  },
  {
    id: "#ORD-003",
    customer: "Noah Williams",
    email: "noah@example.com",
    avatar: "NW",
    plan: "Dedicated Server",
    status: "Processing",
    amount: "$350.00",
    date: "23-10-2026",
  },
  {
    id: "#ORD-004",
    customer: "Emma Brown",
    email: "emma@example.com",
    avatar: "EB",
    plan: "Domain Name",
    status: "Completed",
    amount: "$50.00",
    date: "22-10-2026",
  },
  {
    id: "#ORD-005",
    customer: "James Davis",
    email: "james@example.com",
    avatar: "JD",
    plan: "Cloud Hosting Pro",
    status: "Failed",
    amount: "$250.00",
    date: "21-10-2026",
  },
  {
    id: "#ORD-006",
    customer: "Ava Miller",
    email: "ava@example.com",
    avatar: "AM",
    plan: "Enterprise Email",
    status: "Completed",
    amount: "$120.00",
    date: "21-10-2026",
  },
  {
    id: "#ORD-007",
    customer: "Sophia Wilson",
    email: "sophia@example.com",
    avatar: "SW",
    plan: "SSL Certificate",
    status: "Completed",
    amount: "$80.00",
    date: "20-10-2026",
  },
];

// Helper render Badge trạng thái đồng nhất với Dashboard
const renderStatusBadge = (status: string) => {
  switch (status) {
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-600 bg-emerald-50">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Delivered
        </span>
      );
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-600 bg-amber-50">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Pending
        </span>
      );
    case "Processing":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-blue-600 bg-blue-50">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> InTransit
        </span>
      );
    case "Failed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-rose-600 bg-rose-50">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Cancelled
        </span>
      );
    default:
      return null;
  }
};

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6 font-sans bg-slate-50/50 p-4 sm:p-6 min-h-screen">

      {/* 1. Header & Breadcrumbs chuẩn Dashboard */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
            Order Requests
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Dashboard</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-600 font-medium">Order Requests</span>
          </div>
        </div>

        {/* Nút thao tác nhanh */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium text-slate-600 border-slate-200 rounded-xl bg-white shadow-sm hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Export
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-900 text-white rounded-xl shadow-sm"
          >
            <Plus className="h-4 w-4" /> Add Order
          </Button>
        </div>
      </div>

      {/* 2. Khung Bảng Dữ Liệu Bo Tròn (rounded-2xl) */}
      <Card className="border-slate-200/80 shadow-sm bg-white rounded-2xl overflow-hidden">

        {/* Toolbar Tìm kiếm & Lọc */}
        <CardHeader className="p-4 border-b border-slate-100 bg-white">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search orders..."
                  className="pl-9 h-9 text-xs bg-slate-50/70 border-slate-200/80 rounded-xl text-slate-700 placeholder:text-slate-400 focus-visible:ring-slate-400"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs gap-1.5 border-slate-200/80 rounded-xl text-slate-600 hover:bg-slate-50 shrink-0"
              >
                <Filter className="h-3.5 w-3.5 text-slate-400" /> Filter
              </Button>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <span className="text-slate-700 font-bold">1-7</span> of{" "}
              <span className="text-slate-700 font-bold">152</span> orders
            </div>
          </div>
        </CardHeader>

        {/* Bảng chi tiết */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-slate-100">
                  <TableHead className="w-[100px] text-xs font-semibold text-slate-500">Order ID</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Customer</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Service Plan</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                      Date <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500">Status</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-500">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {mockOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="border-slate-100 hover:bg-slate-50/60 transition-colors text-xs"
                  >
                    {/* Order ID */}
                    <TableCell className="font-semibold text-slate-500 font-mono">
                      {order.id}
                    </TableCell>

                    {/* Customer Info */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200/60 text-slate-600 flex items-center justify-center font-bold text-[11px] shrink-0">
                          {order.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{order.customer}</span>
                          <span className="text-[11px] text-slate-400">{order.email}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Plan */}
                    <TableCell className="font-medium text-slate-600">
                      {order.plan}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-slate-400 text-[11px]">
                      {order.date}
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {renderStatusBadge(order.status)}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="text-right font-bold text-slate-800">
                      {order.amount}
                    </TableCell>

                    {/* Action */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-600"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Phân trang Bottom */}
          <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs text-slate-400">Page 1 of 22</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-slate-200 text-slate-400"
                disabled
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs rounded-lg border-slate-300 bg-slate-800 text-white font-bold"
              >
                1
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                2
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                3
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}