"use client";

import { Search, Plus, Filter, MoreHorizontal, Edit, Mail, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

const mockCustomers = [
  { id: "CUST-839", name: "Liam Johnson", email: "liam@example.com", phone: "+1 (555) 123-4567", role: "Premium Customer", status: "Active", joined: "2022-05-14", spend: "$1,250.00" },
  { id: "CUST-840", name: "Olivia Smith", email: "olivia@example.com", phone: "+1 (555) 987-6543", role: "Standard Customer", status: "Active", joined: "2023-01-20", spend: "$150.00" },
  { id: "CUST-841", name: "Noah Williams", email: "noah@example.com", phone: "+1 (555) 456-7890", role: "Enterprise", status: "Active", joined: "2021-11-05", spend: "$4,500.00" },
  { id: "CUST-842", name: "Emma Brown", email: "emma@example.com", phone: "+44 7700 900077", role: "Standard Customer", status: "Suspended", joined: "2023-08-12", spend: "$50.00" },
  { id: "CUST-843", name: "James Davis", email: "james@example.com", phone: "+1 (555) 321-0987", role: "Standard Customer", status: "Inactive", joined: "2020-03-10", spend: "$0.00" },
];

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer accounts, roles, and access.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            Export CSV
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name, email..."
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
                <TableHead>Customer</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Total Spend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold border border-slate-200">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{customer.name}</div>
                        <div className="text-xs text-slate-500">{customer.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-600 font-normal">
                      {customer.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{customer.joined}</TableCell>
                  <TableCell className="font-medium text-slate-700">{customer.spend}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "Active" ? "success" : customer.status === "Suspended" ? "destructive" : "secondary"}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600">
                        <ShieldAlert className="h-4 w-4" />
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
