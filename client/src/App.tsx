import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import CitizenLogin from "@/pages/auth/CitizenLogin";
import AdvocateLogin from "@/pages/auth/AdvocateLogin";
import JudgeLogin from "@/pages/auth/JudgeLogin";
import ClerkLogin from "@/pages/auth/ClerkLogin";
import CitizenDashboard from "@/pages/dashboards/CitizenDashboard";
import AdvocateDashboard from "@/pages/dashboards/AdvocateDashboard";
import JudgeDashboard from "@/pages/dashboards/JudgeDashboard";
import ClerkDashboard from "@/pages/dashboards/ClerkDashboard";
import CaseDetail from "@/pages/CaseDetail";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!user ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login/citizen" component={CitizenLogin} />
          <Route path="/login/advocate" component={AdvocateLogin} />
          <Route path="/login/judge" component={JudgeLogin} />
          <Route path="/login/clerk" component={ClerkLogin} />
        </>
      ) : (
        <>
          <Route path="/" component={() => {
            if (user.role === "citizen") return <CitizenDashboard />;
            if (user.role === "advocate") return <AdvocateDashboard />;
            if (user.role === "judge") return <JudgeDashboard />;
            if (user.role === "clerk") return <ClerkDashboard />;
            return <NotFound />;
          }} />
          <Route path="/case/:id" component={CaseDetail} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
