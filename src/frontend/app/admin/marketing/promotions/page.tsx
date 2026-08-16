"use client";

import { Search, Plus, Filter, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

const mockPromotions = [
  { id: "PROMO-01", name: "Black Friday 2023", code: "BF2023", discount: "30% OFF", type: "Percentage", status: "Active", uses: 1450, maxUses: 5000, validUntil: "2023-11-30" },
  { id: "PROMO-02", name: "New User Welcome", code: "WELCOME10", discount: "$10.00 OFF", type: "Fixed Amount", status: "Active", uses: 320, maxUses: null, validUntil: "2024-12-31" },
  { id: "PROMO-03", name: "Summer Sale", code: "SUMMER23", discount: "15% OFF", type: "Percentage", status: "Expired", uses: 890, maxUses: 1000, validUntil: "2023-08-31" },
  { id: "PROMO-04", name: "VIP Upgrade", code: "VIPUPGRADE", discount: "50% OFF", type: "Percentage", status: "Active", uses: 45, maxUses: 100, validUntil: "2023-12-31" },
];

export default function PromotionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Promotions & Discounts</h1>
          <p className="text-sm text-slate-500">Manage promotional codes, discounts, and marketing campaigns.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Promotion
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search promotions..."
                className="pl-9 bg-slate-50"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Promo Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPromotions.map((promo) => (
                <TableRow key={promo.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{promo.name}</div>
                    <div className="text-xs text-slate-500">{promo.type}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md w-fit">
                      <Tag className="h-3 w-3" />
                      {promo.code}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-emerald-600">{promo.discount}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-medium text-slate-900">{promo.uses}</span>
                      <span className="text-slate-500"> / {promo.maxUses ? promo.maxUses : '∞'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">{promo.validUntil}</TableCell>
                  <TableCell>
                    <Badge variant={promo.status === "Active" ? "success" : "secondary"}>
                      {promo.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
