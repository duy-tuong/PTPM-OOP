"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500">Manage global site configurations and API keys.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">Site Name</label>
              <Input defaultValue="CloudService Store" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">Support Email</label>
              <Input type="email" defaultValue="support@cloudstore.example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">Maintenance Mode</label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="maintenance" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <label htmlFor="maintenance" className="text-sm font-medium leading-none text-slate-700">
                  Enable maintenance mode (site will be inaccessible to customers)
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Gateway (Stripe)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">Publishable Key</label>
              <Input defaultValue="pk_test_51NxXXXXXXXXXXXXXXXXXXXXXXXXXX" type="password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-slate-700">Secret Key</label>
              <Input defaultValue="sk_test_51NxXXXXXXXXXXXXXXXXXXXXXXXXXX" type="password" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>
    </div>
  );
}
