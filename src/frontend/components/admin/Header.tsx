"use client";

import * as React from "react";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b border-slate-200 bg-white px-6">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full appearance-none bg-slate-50 pl-9 shadow-none md:w-2/3 lg:w-1/3 border-transparent hover:border-slate-200 focus-visible:bg-white"
            />
          </div>
        </form>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Toggle notifications</span>
      </Button>
      <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 text-slate-600 border border-slate-200">
        <User className="h-5 w-5" />
        <span className="sr-only">Toggle user menu</span>
      </Button>
    </header>
  );
}
