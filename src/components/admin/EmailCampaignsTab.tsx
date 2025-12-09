import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Eye,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Send,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface EmailSequence {
  id: string;
  name: string;
  description: string;
  sequence_type: string;
  is_active: boolean;
  created_at: string;
  templates_count?: number;
}

interface EmailTemplate {
  id: string;
  sequence_id: string;
  name: string;
  subject: string;
  html_content: string;
  delay_days: number;
  step_order: number;
  is_active: boolean;
}

interface EmailStats {
  total_subscriptions: number;
  active_subscriptions: number;
  unsubscribed: number;
  emails_sent: number;
  emails_pending: number;
  conversions: number;
}

export function EmailCampaignsTab() {
  const { toast } = useToast();
  const [sequences, setSequences] = useState<EmailSequence[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSequence, setSelectedSequence] = useState<EmailSequence | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showSequenceDialog, setShowSequenceDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form states
  const [sequenceForm, setSequenceForm] = useState({
    name: "",
    description: "",
    sequence_type: "prospect",
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    html_content: "",
    delay_days: 0,
    step_order: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load sequences with template count
      const { data: seqData, error: seqError } = await supabase
        .from("email_sequences")
        .select("*, email_templates(count)")
        .order("created_at", { ascending: false });

      if (seqError) throw seqError;

      const sequencesWithCount = seqData?.map(seq => ({
        ...seq,
        templates_count: seq.email_templates?.[0]?.count || 0
      })) || [];

      setSequences(sequencesWithCount);

      // Load stats
      const [subsResult, activeResult, unsubResult, sentResult, pendingResult, convertedResult] = await Promise.all([
        supabase.from("email_subscriptions").select("*", { count: "exact", head: true }),
        supabase.from("email_subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("email_subscriptions").select("*", { count: "exact", head: true }).eq("status", "unsubscribed"),
        supabase.from("email_logs").select("*", { count: "exact", head: true }),
        supabase.from("email_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("email_sequence_enrollments").select("*", { count: "exact", head: true }).eq("status", "converted"),
      ]);

      setStats({
        total_subscriptions: subsResult.count || 0,
        active_subscriptions: activeResult.count || 0,
        unsubscribed: unsubResult.count || 0,
        emails_sent: sentResult.count || 0,
        emails_pending: pendingResult.count || 0,
        conversions: convertedResult.count || 0,
      });

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load email campaigns data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async (sequenceId: string) => {
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("sequence_id", sequenceId)
      .order("step_order", { ascending: true });

    if (error) {
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
      return;
    }

    setTemplates(data || []);
  };

  const handleSelectSequence = async (sequence: EmailSequence) => {
    setSelectedSequence(sequence);
    await loadTemplates(sequence.id);
  };

  const handleCreateSequence = async () => {
    try {
      const { error } = await supabase
        .from("email_sequences")
        .insert({
          name: sequenceForm.name,
          description: sequenceForm.description,
          sequence_type: sequenceForm.sequence_type,
        });

      if (error) throw error;

      toast({ title: "Success", description: "Sequence created successfully" });
      setShowSequenceDialog(false);
      setSequenceForm({ name: "", description: "", sequence_type: "prospect" });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleToggleSequence = async (sequence: EmailSequence) => {
    try {
      const { error } = await supabase
        .from("email_sequences")
        .update({ is_active: !sequence.is_active })
        .eq("id", sequence.id);

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: `Sequence ${sequence.is_active ? "paused" : "activated"}` 
      });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteSequence = async (sequenceId: string) => {
    if (!confirm("Are you sure? This will delete all templates in this sequence.")) return;

    try {
      const { error } = await supabase
        .from("email_sequences")
        .delete()
        .eq("id", sequenceId);

      if (error) throw error;

      toast({ title: "Success", description: "Sequence deleted" });
      setSelectedSequence(null);
      setTemplates([]);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedSequence) return;

    try {
      if (editingTemplate) {
        // Update existing
        const { error } = await supabase
          .from("email_templates")
          .update({
            name: templateForm.name,
            subject: templateForm.subject,
            html_content: templateForm.html_content,
            delay_days: templateForm.delay_days,
            step_order: templateForm.step_order,
          })
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast({ title: "Success", description: "Template updated" });
      } else {
        // Create new
        const { error } = await supabase
          .from("email_templates")
          .insert({
            sequence_id: selectedSequence.id,
            name: templateForm.name,
            subject: templateForm.subject,
            html_content: templateForm.html_content,
            delay_days: templateForm.delay_days,
            step_order: templateForm.step_order,
          });

        if (error) throw error;
        toast({ title: "Success", description: "Template created" });
      }

      setShowTemplateDialog(false);
      setEditingTemplate(null);
      setTemplateForm({ name: "", subject: "", html_content: "", delay_days: 0, step_order: 1 });
      loadTemplates(selectedSequence.id);
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      html_content: template.html_content,
      delay_days: template.delay_days,
      step_order: template.step_order,
    });
    setShowTemplateDialog(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({ title: "Success", description: "Template deleted" });
      if (selectedSequence) {
        loadTemplates(selectedSequence.id);
      }
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleProcessQueue = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("process-email-queue");
      
      if (error) throw error;

      toast({
        title: "Queue Processed",
        description: `Sent: ${data.sent}, Skipped: ${data.skipped}, Failed: ${data.failed}`,
      });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p>Loading email campaigns...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{stats?.total_subscriptions || 0}</p>
            <p className="text-xs text-muted-foreground">Total Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{stats?.active_subscriptions || 0}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <p className="text-2xl font-bold">{stats?.unsubscribed || 0}</p>
            <p className="text-xs text-muted-foreground">Unsubscribed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Send className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{stats?.emails_sent || 0}</p>
            <p className="text-xs text-muted-foreground">Emails Sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{stats?.emails_pending || 0}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-teal-500" />
            <p className="text-2xl font-bold">{stats?.conversions || 0}</p>
            <p className="text-xs text-muted-foreground">Conversions</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Dialog open={showSequenceDialog} onOpenChange={setShowSequenceDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Sequence
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Email Sequence</DialogTitle>
              <DialogDescription>
                Create a new automated email sequence
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Sequence Name</Label>
                <Input
                  value={sequenceForm.name}
                  onChange={(e) => setSequenceForm({ ...sequenceForm, name: e.target.value })}
                  placeholder="e.g., Prospect Nurture"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={sequenceForm.description}
                  onChange={(e) => setSequenceForm({ ...sequenceForm, description: e.target.value })}
                  placeholder="Describe this sequence..."
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={sequenceForm.sequence_type}
                  onValueChange={(v) => setSequenceForm({ ...sequenceForm, sequence_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="ambassador">Ambassador</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSequenceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSequence}>Create Sequence</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleProcessQueue} disabled={processing}>
          {processing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          Process Queue Now
        </Button>

        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Sequences List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Email Sequences</CardTitle>
            <CardDescription>Click to manage templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sequences.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sequences yet. Create one to get started.
              </p>
            ) : (
              sequences.map((seq) => (
                <div
                  key={seq.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSequence?.id === seq.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => handleSelectSequence(seq)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{seq.name}</span>
                    <Badge variant={seq.is_active ? "default" : "secondary"}>
                      {seq.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{seq.sequence_type}</Badge>
                    <span>{seq.templates_count || 0} emails</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Templates Editor */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {selectedSequence ? selectedSequence.name : "Select a Sequence"}
                </CardTitle>
                <CardDescription>
                  {selectedSequence?.description || "Click on a sequence to manage its emails"}
                </CardDescription>
              </div>
              {selectedSequence && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleSequence(selectedSequence)}
                  >
                    {selectedSequence.is_active ? (
                      <><Pause className="w-4 h-4 mr-1" /> Pause</>
                    ) : (
                      <><Play className="w-4 h-4 mr-1" /> Activate</>
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSequence(selectedSequence.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSequence ? (
              <div className="space-y-4">
                <Button
                  onClick={() => {
                    setEditingTemplate(null);
                    setTemplateForm({
                      name: "",
                      subject: "",
                      html_content: getDefaultTemplateHtml(),
                      delay_days: templates.length * 2,
                      step_order: templates.length + 1,
                    });
                    setShowTemplateDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Email
                </Button>

                {templates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No emails in this sequence. Add one to get started.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template, index) => (
                      <div
                        key={template.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">{template.subject}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Day {template.delay_days}
                                </Badge>
                                <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                                  {template.is_active ? "Active" : "Disabled"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a sequence from the left to manage its emails</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Template Editor Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Email Template" : "Create Email Template"}
            </DialogTitle>
            <DialogDescription>
              Use {"{{first_name}}"} for personalization. HTML is supported.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g., Welcome Email"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Send on Day</Label>
                  <Input
                    type="number"
                    min="0"
                    value={templateForm.delay_days}
                    onChange={(e) => setTemplateForm({ ...templateForm, delay_days: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Step Order</Label>
                  <Input
                    type="number"
                    min="1"
                    value={templateForm.step_order}
                    onChange={(e) => setTemplateForm({ ...templateForm, step_order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Subject Line</Label>
              <Input
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                placeholder="🌴 Welcome {{first_name}}! Your Exclusive Travel Video Is Ready"
              />
            </div>
            <div>
              <Label>Email Body (HTML)</Label>
              <Textarea
                value={templateForm.html_content}
                onChange={(e) => setTemplateForm({ ...templateForm, html_content: e.target.value })}
                placeholder="<html>...</html>"
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Default HTML template
function getDefaultTemplateHtml(): string {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0077B6, #00A8E8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .cta-button { display: inline-block; background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Hi {{first_name}}! 👋</h1>
  </div>
  <div class="content">
    <p>Your email content goes here...</p>
    
    <p style="text-align: center;">
      <a href="https://iluvmytravelclub.com" class="cta-button">Learn More</a>
    </p>
    
    <p>Best regards,<br/>
    <strong>Donna & Charles</strong></p>
  </div>
</body>
</html>`;
}

