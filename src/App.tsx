import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetails from "./pages/LeadDetails";
import Contacts from "./pages/Contacts";
import Companies from "./pages/Companies";
import Opportunities from "./pages/Opportunities";
import Activities from "./pages/Activities";
import Communications from "./pages/Communications";
import Reports from "./pages/Reports";
import SmartViews from "./pages/SmartViews";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="leads/:leadId" element={<LeadDetails />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="companies" element={<Companies />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="activities" element={<Activities />} />
            <Route path="communications" element={<Communications />} />
            <Route path="communications/:type" element={<Communications />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:reportType" element={<Reports />} />
            <Route path="smart-views" element={<SmartViews />} />
            <Route path="templates" element={<Templates />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
