import { Switch, Route } from "wouter";
import { createContext, useContext, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CurrencySwitcher, type DisplayCurrency } from "@/components/CurrencySwitcher";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Loader2, Save, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface CurrencyContextType {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  displayCurrency: "BRL",
  setDisplayCurrency: () => {},
});

export function useDisplayCurrency() {
  return useContext(CurrencyContext);
}

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import CryptoPage from "@/pages/crypto";
import FixedIncomePage from "@/pages/fixed-income";
import VariableIncomePage from "@/pages/variable-income";
import RealEstatePage from "@/pages/real-estate";
import HistoryPage from "@/pages/history";
import StatementsPage from "@/pages/statements";
import LandingPage from "@/pages/landing";
import DeBankBalances from "@/pages/debank-balances";
import UpdateInvestmentsPage from "@/pages/update-investments";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/crypto" component={CryptoPage} />
      <Route path="/fixed-income" component={FixedIncomePage} />
      <Route path="/variable-income" component={VariableIncomePage} />
      <Route path="/real-estate" component={RealEstatePage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/statements" component={StatementsPage} />
      <Route path="/debank" component={DeBankBalances} />
      <Route path="/update-investments" component={UpdateInvestmentsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>("BRL");
  const [isSaved, setIsSaved] = useState(false);
  
  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/sync");
      return true;
    },
    onSuccess: () => {
      setIsSaved(true);
      toast({
        title: "Dados salvos com sucesso!",
        description: "Todas as suas alterações foram sincronizadas no servidor.",
      });
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    },
  });
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <CurrencyContext.Provider value={{ displayCurrency, setDisplayCurrency }}>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between gap-4 p-3 border-b bg-background sticky top-0 z-50">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-3">
                <CurrencySwitcher value={displayCurrency} onChange={setDisplayCurrency} />
                <ThemeToggle />
                {user && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      data-testid="button-save-changes"
                      className="gap-2"
                    >
                      {saveMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isSaved ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">
                        {isSaved ? "Salvo!" : "Salvar"}
                      </span>
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user.firstName?.[0] || user.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm hidden sm:inline">
                      {user.firstName || user.username || user.email}
                    </span>
                    <Button variant="ghost" size="icon" asChild>
                      <a href="/api/logout">
                        <LogOut className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </header>
            <main className="flex-1 overflow-auto bg-background">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </CurrencyContext.Provider>
  );
}

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <AuthenticatedApp />;
}

function AppWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <App />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default AppWrapper;
