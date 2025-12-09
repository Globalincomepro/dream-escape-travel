import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PendingApplicationsTab } from "@/components/admin/PendingApplicationsTab";
import { ActiveAmbassadorsTab } from "@/components/admin/ActiveAmbassadorsTab";
import { SystemOverviewTab } from "@/components/admin/SystemOverviewTab";
import { SystemUrlsTab } from "@/components/admin/SystemUrlsTab";
import { Shield } from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
                <CardDescription>
                  Manage ambassador applications and monitor platform performance
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Applications</TabsTrigger>
            <TabsTrigger value="ambassadors">Active Ambassadors</TabsTrigger>
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="urls">System URLs</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingApplicationsTab />
          </TabsContent>

          <TabsContent value="ambassadors">
            <ActiveAmbassadorsTab />
          </TabsContent>

          <TabsContent value="overview">
            <SystemOverviewTab />
          </TabsContent>

          <TabsContent value="urls">
            <SystemUrlsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
