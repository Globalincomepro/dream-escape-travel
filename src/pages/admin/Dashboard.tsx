import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PendingApplicationsTab } from "@/components/admin/PendingApplicationsTab";
import { ActiveAmbassadorsTab } from "@/components/admin/ActiveAmbassadorsTab";
import { SystemOverviewTab } from "@/components/admin/SystemOverviewTab";
import { SystemUrlsTab } from "@/components/admin/SystemUrlsTab";
import { Navigation } from "@/components/Navigation";
import { Shield, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
                  <CardDescription>
                    Manage ambassador applications and monitor platform performance
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/')}>
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
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
