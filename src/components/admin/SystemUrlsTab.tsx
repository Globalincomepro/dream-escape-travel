import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Copy, Globe, Users, Shield, Layout, Calendar, BarChart3, Settings, FileText, Megaphone, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UrlItem {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  isDynamic?: boolean;
  example?: string;
}

interface UrlCategory {
  title: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline";
  urls: UrlItem[];
}

export const SystemUrlsTab = () => {
  const { toast } = useToast();

  const copyToClipboard = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "URL Copied",
      description: "URL has been copied to clipboard",
    });
  };

  const openUrl = (path: string) => {
    window.open(path, '_blank');
  };

  const categories: UrlCategory[] = [
    {
      title: "Public URLs",
      badge: "Public",
      badgeVariant: "secondary",
      urls: [
        {
          path: "/",
          title: "Landing Page",
          description: "Main homepage with hero section and lead capture form",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          path: "/webinar",
          title: "Webinar Registration",
          description: "Webinar signup page for prospects to register",
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          path: "/auth",
          title: "Authentication",
          description: "Sign up and sign in page for users",
          icon: <Shield className="h-4 w-4" />,
        },
        {
          path: "/pending",
          title: "Pending Approval",
          description: "Page shown to users awaiting ambassador approval",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          path: "/f/:slug",
          title: "Ambassador Funnel",
          description: "Dynamic funnel pages for each ambassador (e.g., /f/john-smith)",
          icon: <Layout className="h-4 w-4" />,
          isDynamic: true,
          example: "/f/example-ambassador",
        },
      ],
    },
    {
      title: "Ambassador URLs",
      badge: "Ambassador",
      badgeVariant: "default",
      urls: [
        {
          path: "/ambassador/dashboard",
          title: "Ambassador Dashboard",
          description: "Main dashboard with stats, funnel URL, and quick actions",
          icon: <Layout className="h-4 w-4" />,
        },
        {
          path: "/ambassador/settings",
          title: "Funnel Settings",
          description: "Customize funnel profile, gallery, and links",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          path: "/ambassador/content",
          title: "Content Library",
          description: "Browse and download images/captions for social media",
          icon: <FileText className="h-4 w-4" />,
        },
        {
          path: "/my-leads",
          title: "Lead Management",
          description: "View and manage leads captured from your funnel",
          icon: <Users className="h-4 w-4" />,
        },
      ],
    },
    {
      title: "Admin URLs",
      badge: "Admin",
      badgeVariant: "outline",
      urls: [
        {
          path: "/admin/dashboard",
          title: "Admin Dashboard",
          description: "Manage ambassador applications and monitor platform performance",
          icon: <Shield className="h-4 w-4" />,
        },
        {
          path: "/ambassador/scheduled-posts",
          title: "Scheduled Posts (Admin)",
          description: "View and manage scheduled social media posts via Zapier",
          icon: <Megaphone className="h-4 w-4" />,
        },
        {
          path: "/ambassador/analytics/social",
          title: "Social Analytics (Admin)",
          description: "Track social media performance and engagement metrics",
          icon: <BarChart3 className="h-4 w-4" />,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <Card key={category.title}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {category.title}
                  <Badge variant={category.badgeVariant}>{category.badge}</Badge>
                </CardTitle>
                <CardDescription>
                  {category.title === "Public URLs" && "Accessible to everyone without authentication"}
                  {category.title === "Ambassador URLs" && "Requires ambassador role access"}
                  {category.title === "Admin URLs" && "Requires admin role access"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.urls.map((url) => (
                <div
                  key={url.path}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1 text-primary">
                    {url.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{url.title}</h4>
                      {url.isDynamic && (
                        <Badge variant="secondary" className="text-xs">Dynamic</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{url.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {url.isDynamic && url.example ? url.example : url.path}
                    </code>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(url.isDynamic && url.example ? url.example : url.path)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => openUrl(url.isDynamic && url.example ? url.example : url.path)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Additional Resources
          </CardTitle>
          <CardDescription>Backend functions and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Edge Functions</span>
              <Badge variant="secondary">5 Active</Badge>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 pl-3">
              <div>• notify-admin-new-lead</div>
              <div>• process-scheduled-posts</div>
              <div>• send-social-post</div>
              <div>• send-welcome-email</div>
              <div>• track-social-click</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
