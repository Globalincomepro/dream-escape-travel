import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Loader2, Calendar, User, Phone, Mail } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PendingApplication {
  id: string;
  user_id: string;
  application_note: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export const PendingApplicationsTab = () => {
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data: pendingData, error } = await supabase
        .from("pending_ambassadors")
        .select("id, user_id, application_note, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data for each application
      const applicationsWithProfiles = await Promise.all(
        (pendingData || []).map(async (app) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email, phone")
            .eq("id", app.user_id)
            .single();

          return {
            ...app,
            profiles: profile || { full_name: "", email: "", phone: "" },
          };
        })
      );

      setApplications(applicationsWithProfiles);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load pending applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, applicationId: string) => {
    setProcessingId(applicationId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("approve_ambassador", {
        _user_id: userId,
        _admin_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ambassador application approved",
      });
      
      fetchApplications();
    } catch (error) {
      console.error("Error approving application:", error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId: string, applicationId: string) => {
    setProcessingId(applicationId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("pending_ambassadors")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (error) throw error;

      toast({
        title: "Application Rejected",
        description: "The application has been rejected",
      });
      
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No Pending Applications</p>
          <p className="text-sm text-muted-foreground mt-2">
            All applications have been reviewed
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {applications.map((app) => (
        <Card key={app.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {app.profiles.full_name || "Unknown"}
            </CardTitle>
            <CardDescription className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="text-xs">{app.profiles.email}</span>
              </div>
              {app.profiles.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-xs">{app.profiles.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">
                  {new Date(app.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {app.application_note && (
              <div className="text-sm bg-muted p-3 rounded-md">
                <p className="font-medium mb-1">Application Note:</p>
                <p className="text-muted-foreground">{app.application_note}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleApprove(app.user_id, app.id)}
                disabled={processingId === app.id}
              >
                {processingId === app.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={processingId === app.id}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this ambassador application?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleReject(app.user_id, app.id)}
                    >
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
