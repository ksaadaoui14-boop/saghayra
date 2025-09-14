import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

function Router({ currentLanguage, currentCurrency }: { currentLanguage: string; currentCurrency: string }) {
  return (
    <Switch>
      <Route path="/" component={() => <Home currentLanguage={currentLanguage} currentCurrency={currentCurrency} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [currentCurrency, setCurrentCurrency] = useState("USD");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header 
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            onLanguageChange={setCurrentLanguage}
            onCurrencyChange={setCurrentCurrency}
          />
          <main className="flex-1">
            <Router currentLanguage={currentLanguage} currentCurrency={currentCurrency} />
          </main>
          <Footer currentLanguage={currentLanguage} />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;