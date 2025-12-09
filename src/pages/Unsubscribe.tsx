import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      handleUnsubscribe(token);
    } else {
      setStatus("error");
      setErrorMessage("Invalid unsubscribe link");
    }
  }, [searchParams]);

  const handleUnsubscribe = async (token: string) => {
    try {
      // Decode email from token
      const decodedEmail = atob(token);
      setEmail(decodedEmail);

      // Call unsubscribe function
      const { error } = await supabase.functions.invoke("unsubscribe-email", {
        body: { email: decodedEmail },
      });

      if (error) throw error;

      setStatus("success");
    } catch (err: any) {
      console.error("Unsubscribe error:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to unsubscribe");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
              <CardTitle>Processing...</CardTitle>
              <CardDescription>Please wait while we update your preferences</CardDescription>
            </>
          )}
          
          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <CardTitle>You're Unsubscribed</CardTitle>
              <CardDescription>
                We've removed <strong>{email}</strong> from our email list.
              </CardDescription>
            </>
          )}
          
          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <CardTitle>Something Went Wrong</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center">
          {status === "success" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                We're sorry to see you go! If you change your mind, you're always welcome back.
              </p>
              <Button onClick={() => window.location.href = "/"}>
                Visit Our Website
              </Button>
            </div>
          )}
          
          {status === "error" && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Please contact support if you continue to have issues.
              </p>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Go to Homepage
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;

