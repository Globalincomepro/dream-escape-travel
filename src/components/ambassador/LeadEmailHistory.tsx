import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  Mail, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Send,
  Eye,
  AlertCircle,
  Loader2
} from "lucide-react";

interface EmailLog {
  id: string;
  email_to: string;
  subject: string;
  status: string;
  created_at: string;
  opened_at?: string;
  clicked_at?: string;
  template?: {
    name: string;
    sequence?: {
      name: string;
    };
  };
}

interface QueuedEmail {
  id: string;
  scheduled_for: string;
  status: string;
  template?: {
    name: string;
    subject: string;
  };
}

interface Enrollment {
  id: string;
  status: string;
  current_step: number;
  enrolled_at: string;
  completed_at?: string;
  converted_at?: string;
  sequence?: {
    name: string;
    sequence_type: string;
  };
}

interface LeadEmailHistoryProps {
  leadEmail: string;
  leadName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LeadEmailHistory({ leadEmail, leadName, isOpen, onClose }: LeadEmailHistoryProps) {
  const [loading, setLoading] = useState(true);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [queuedEmails, setQueuedEmails] = useState<QueuedEmail[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    if (isOpen && leadEmail) {
      loadEmailHistory();
    }
  }, [isOpen, leadEmail]);

  const loadEmailHistory = async () => {
    setLoading(true);
    try {
      // Get subscription ID
      const { data: subscription } = await supabase
        .from("email_subscriptions")
        .select("id, status")
        .eq("email", leadEmail)
        .single();

      if (!subscription) {
        setLoading(false);
        return;
      }

      // Load email logs
      const { data: logs } = await supabase
        .from("email_logs")
        .select(`
          id,
          email_to,
          subject,
          status,
          created_at,
          opened_at,
          clicked_at,
          template:email_templates!template_id (
            name,
            sequence:email_sequences!sequence_id (
              name
            )
          )
        `)
        .eq("email_to", leadEmail)
        .order("created_at", { ascending: false });

      setEmailLogs(logs || []);

      // Load queued emails
      const { data: queued } = await supabase
        .from("email_queue")
        .select(`
          id,
          scheduled_for,
          status,
          template:email_templates!template_id (
            name,
            subject
          )
        `)
        .eq("subscription_id", subscription.id)
        .in("status", ["pending", "processing"])
        .order("scheduled_for", { ascending: true });

      setQueuedEmails(queued || []);

      // Load enrollments
      const { data: enroll } = await supabase
        .from("email_sequence_enrollments")
        .select(`
          id,
          status,
          current_step,
          enrolled_at,
          completed_at,
          converted_at,
          sequence:email_sequences!sequence_id (
            name,
            sequence_type
          )
        `)
        .eq("subscription_id", subscription.id)
        .order("enrolled_at", { ascending: false });

      setEnrollments(enroll || []);

    } catch (error) {
      console.error("Error loading email history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "opened":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "clicked":
        return <Send className="w-4 h-4 text-purple-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed":
      case "bounced":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEnrollmentBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      case "converted":
        return <Badge className="bg-purple-500">Converted! 🎉</Badge>;
      case "unsubscribed":
        return <Badge variant="destructive">Unsubscribed</Badge>;
      case "paused":
        return <Badge variant="secondary">Paused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email History: {leadName}
          </DialogTitle>
          <DialogDescription>
            {leadEmail}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sequence Enrollments */}
            {enrollments.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Sequence Status</h3>
                <div className="space-y-2">
                  {enrollments.map((enrollment) => (
                    <Card key={enrollment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{enrollment.sequence?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Enrolled: {formatDate(enrollment.enrolled_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            {getEnrollmentBadge(enrollment.status)}
                            {enrollment.converted_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Converted: {formatDate(enrollment.converted_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Emails */}
            {queuedEmails.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Upcoming Emails
                </h3>
                <div className="space-y-2">
                  {queuedEmails.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                    >
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{email.template?.name}</p>
                        <p className="text-xs text-muted-foreground">{email.template?.subject}</p>
                      </div>
                      <Badge variant="outline">
                        {formatDate(email.scheduled_for)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Emails */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Email History ({emailLogs.length})
              </h3>
              {emailLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No emails sent yet
                </p>
              ) : (
                <div className="space-y-2">
                  {emailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      {getStatusIcon(log.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{log.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.template?.name} • {log.template?.sequence?.name}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{formatDate(log.created_at)}</p>
                        <Badge variant="outline" className="mt-1">
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {emailLogs.length === 0 && queuedEmails.length === 0 && enrollments.length === 0 && (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No email activity for this lead yet</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

