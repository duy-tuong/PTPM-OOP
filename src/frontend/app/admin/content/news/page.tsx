"use client";

import { Search, Plus, Filter, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

const mockNews = [
  { id: "NWS-01", title: "New Cloud Storage Options Released", category: "Product Update", author: "Admin", status: "Published", date: "2023-10-24", views: 1240 },
  { id: "NWS-02", title: "5 Tips for Securing Your VPS", category: "Tutorials", author: "Security Team", status: "Published", date: "2023-10-22", views: 890 },
  { id: "NWS-03", title: "Upcoming Maintenance: Datacenter A", category: "Announcements", author: "Ops Team", status: "Draft", date: "2023-10-20", views: 0 },
  { id: "NWS-04", title: "Why Dedicated Servers are Still Relevant", category: "Insights", author: "Admin", status: "Published", date: "2023-10-15", views: 3450 },
  { id: "NWS-05", title: "Black Friday Sale 2023 Preview", category: "Promotions", author: "Marketing", status: "Archived", date: "2023-10-10", views: 5600 },
];

export default function NewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">News Articles</h1>
          <p className="text-sm text-slate-500">Create and manage content for the company blog and announcements.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Create Article
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search articles..."
                className="pl-9 bg-slate-50"
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Showing 1-5 of 84 articles</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockNews.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className="font-medium text-slate-900">{article.title}</div>
                    <div className="text-xs text-slate-500">By {article.author}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-slate-500 font-normal">
                      {article.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.status === "Published" ? "success" : article.status === "Draft" ? "warning" : "secondary"}>
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">{article.date}</TableCell>
                  <TableCell className="text-right font-medium text-slate-600">{article.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
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
