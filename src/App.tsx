import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Webinar from "./pages/Webinar";
import Auth from "./pages/Auth";
import Pending from "./pages/Pending";
import MyLeads from "./pages/MyLeads";
import Funnel from "./pages/Funnel";
import Quiz from "./pages/Quiz";
import Calculator from "./pages/Calculator";
import AmbassadorDashboard from "./pages/ambassador/Dashboard";
import AmbassadorSettings from "./pages/ambassador/Settings";
import AmbassadorContent from "./pages/ambassador/Content";
import ScheduledPosts from "./pages/ambassador/ScheduledPosts";
import SocialAnalytics from "./pages/ambassador/SocialAnalytics";
import AdminDashboard from "./pages/admin/Dashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AIChat } from "./components/AIChat";
import { SocialProofNotifications } from "./components/SocialProofNotifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/webinar" element={<Webinar />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/f/:funnelSlug" element={<Funnel />} />
          <Route 
            path="/my-leads" 
            element={
              <ProtectedRoute requiredRole="ambassador">
                <MyLeads />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ambassador/dashboard" 
            element={
              <ProtectedRoute requiredRole="ambassador">
                <AmbassadorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ambassador/settings" 
            element={
              <ProtectedRoute requiredRole="ambassador">
                <AmbassadorSettings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ambassador/content" 
            element={
              <ProtectedRoute requiredRole="ambassador">
                <AmbassadorContent />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ambassador/scheduled-posts" 
            element={
              <ProtectedRoute requiredRole="ambassador">
                <ScheduledPosts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ambassador/analytics/social" 
            element={
              <ProtectedRoute requiredRole="ambassador">
                <SocialAnalytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        {/* AI Features - Available on all pages */}
        <AIChat />
        <SocialProofNotifications />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
