"use client";

import * as React from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  Download,
  Sparkles,
  Server,
  Layers,
  CheckCircle2,
  Clock,
  Archive,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

const mockServices = [
  { id: "SRV-001", name: "VPS Basic", category: "Virtual Private Server", price: "$15.00", interval: "/tháng", status: "Active", features: 4, isPopular: false },
  { id: "SRV-002", name: "VPS Pro", category: "Virtual Private Server", price: "$45.00", interval: "/tháng", status: "Active", features: 8, isPopular: true },
  { id: "SRV-003", name: "Cloud Hosting Standard", category: "Cloud Hosting", price: "$10.00", interval: "/tháng", status: "Active", features: 3, isPopular: false },
  { id: "SRV-004", name: "Cloud Hosting Pro", category: "Cloud Hosting", price: "$25.00", interval: "/tháng", status: "Active", features: 6, isPopular: true },
  { id: "SRV-005", name: "Dedicated Server - Intel Xeon", category: "Dedicated Servers", price: "$150.00", interval: "/tháng", status: "Draft", features: 12, isPopular: false },
  { id: "SRV-006", name: "Enterprise Email", category: "Email Hosting", price: "$5.00", interval: "/tháng", status: "Active", features: 2, isPopular: false },
  { id: "SRV-007", name: "Legacy Shared Hosting", category: "Shared Hosting", price: "$3.00", interval: "/tháng", status: "Archived", features: 2, isPopular: false },
];

export default function ServicesPage() {
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = React.useState("All");

  const toggleSelectAll = () => {
    if (selectedRows.length === mockServices.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(mockServices.map((s) => s.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full p-2 font-sans">

      {/* 1. Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Gói dịch vụ (Service Plans)
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {mockServices.length} gói hiện có
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Quản lý bảng giá, thông số kỹ thuật và trạng thái các gói dịch vụ lưu trữ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs font-medium text-slate-700 bg-white">
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Xuất dữ liệu
          </Button>
          <Button size="sm" className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm">
            <Plus className="h-4 w-4" />
            Thêm gói dịch vụ
          </Button>
        </div>
      </div>

      {/* 2. Visual Metrics Grid (Biểu thị chỉ số bằng thanh tiến trình trực quan) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Active Metric */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đang hoạt động (Active)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900">5 gói</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                71.4% <ArrowUpRight className="h-3 w-3 ml-0.5" />
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: "71.4%" }} />
            </div>
          </div>
        </div>

        {/* Draft Metric */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bản nháp (Draft)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900">1 gói</span>
              <span className="text-xs font-semibold text-amber-600">14.3%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-amber-400" style={{ width: "14.3%" }} />
            </div>
          </div>
        </div>

        {/* Archived Metric */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đã lưu trữ (Archived)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Archive className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900">1 gói</span>
              <span className="text-xs font-semibold text-slate-500">14.3%</span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-slate-400" style={{ width: "14.3%" }} />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Data Table Card */}
      <Card className="border-slate-200/80 shadow-sm overflow-hidden bg-white">

        {/* Toolbar Top */}
        <div className="flex flex-col gap-3 p-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Active", "Draft", "Archived"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${selectedStatus === status
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-200/60"
                  }`}
              >
                {status === "All" ? "Tất cả" : status === "Active" ? "Đang chạy" : status === "Draft" ? "Bản nháp" : "Lưu trữ"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Tìm theo tên dịch vụ, mã SRV..."
                className="pl-9 h-8 text-xs bg-white border-slate-200"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-slate-600 bg-white border-slate-200">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              Bộ lọc
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-12 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === mockServices.length}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">
                    <button className="flex items-center gap-1 hover:text-slate-900">
                      Tên dịch vụ <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </button>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Danh mục</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">
                    <button className="flex items-center gap-1 hover:text-slate-900">
                      Giá niêm yết <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </button>
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Tính năng</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600">Trạng thái</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 text-right pr-6">Thao tác</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {mockServices.map((service) => {
                  const isSelected = selectedRows.includes(service.id);
                  return (
                    <TableRow
                      key={service.id}
                      className={`group transition-colors border-slate-100 ${isSelected ? "bg-blue-50/40 hover:bg-blue-50/60" : "hover:bg-slate-50/80"
                        }`}
                    >
                      {/* Checkbox Select Row */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(service.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 cursor-pointer"
                        />
                      </TableCell>

                      {/* Service Info */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 text-slate-600 group-hover:border-slate-300 group-hover:bg-white transition-all">
                            <Server className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                                {service.name}
                              </span>
                              {service.isPopular && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200/60">
                                  <Sparkles className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Hot
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">{service.id}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{service.category}</span>
                        </div>
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">{service.price}</span>
                          <span className="text-[11px] text-slate-400">{service.interval}</span>
                        </div>
                      </TableCell>

                      {/* Features */}
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {service.features} tính năng
                        </span>
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {service.status === "Active" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đang chạy
                          </span>
                        )}
                        {service.status === "Draft" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Bản nháp
                          </span>
                        )}
                        {service.status === "Archived" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Lưu trữ
                          </span>
                        )}
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                            title="Sửa"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Xóa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
                            title="Khác"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}