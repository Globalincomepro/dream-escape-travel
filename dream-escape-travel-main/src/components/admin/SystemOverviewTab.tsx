import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, FileText, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SystemMetrics {
  totalAmbassadors: number;
  pendingApplications: number;
  totalLeads: number;
  totalPosts: number;
  avgLeadsPerAmbassador: number;
  topPerformers: Array<{
    name: string;
    leads: number;
  }>;
}

export const SystemOverviewTab = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalAmbassadors: 0,
    pendingApplications: 0,
    totalLeads: 0,
    totalPosts: 0,
    avgLeadsPerAmbassador: 0,
    topPerformers: [],
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const [ambassadors, pending, leads, posts] = await Promise.all([
        supabase.from("user_roles").select("user_id", { count: "exact", head: true }).eq("role", "ambassador"),
        supabase.from("pending_ambassadors").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("scheduled_posts").select("id", { count: "exact", head: true }),
      ]);

      // Fetch top performers
      const { data: leadsData } = await supabase
        .from("leads")
        .select("ambassador_id")
        .not("ambassador_id", "is", null);

      const leadCounts = (leadsData || []).reduce((acc: Record<string, number>, lead) => {
        if (lead.ambassador_id) {
          acc[lead.ambassador_id] = (acc[lead.ambassador_id] || 0) + 1;
        }
        return acc;
      }, {});

      const topAmbassadorIds = Object.entries(leadCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", topAmbassadorIds);

      const topPerformers = topAmbassadorIds
        .map((id) => ({
          name: profiles?.find((p) => p.id === id)?.full_name || "Unknown",
          leads: leadCounts[id],
        }));

      const totalAmbassadors = ambassadors.count || 0;
      const totalLeads = leads.count || 0;

      setMetrics({
        totalAmbassadors,
        pendingApplications: pending.count || 0,
        totalLeads,
        totalPosts: posts.count || 0,
        avgLeadsPerAmbassador: totalAmbassadors > 0 ? Math.round(totalLeads / totalAmbassadors) : 0,
        topPerformers,
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Error",
        description: "Failed to load system metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const chartConfig = {
    leads: {
      label: "Leads",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ambassadors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAmbassadors}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.pendingApplications} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.avgLeadsPerAmbassador} avg per ambassador
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPosts}</div>
            <p className="text-xs text-muted-foreground">Across all platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Apps</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers Chart */}
      {metrics.topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Ambassadors</CardTitle>
            <CardDescription>Based on total leads generated</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topPerformers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Average Leads per Ambassador</p>
              <p className="text-3xl font-bold text-primary mt-2">{metrics.avgLeadsPerAmbassador}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Total Platform Activity</p>
              <p className="text-3xl font-bold text-primary mt-2">
                {metrics.totalLeads + metrics.totalPosts}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Leads + Posts Combined
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
