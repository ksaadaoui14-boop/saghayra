import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; 
import Home from "@/pages/Home";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminActivities from "@/pages/AdminActivities";
import AdminBookings from "@/pages/AdminBookings";
import AdminTranslations from "@/pages/AdminTranslations";
import AdminGallery from "@/pages/AdminGallery";
import Gallery from "@/pages/Gallery";
import NotFound from "@/pages/not-found";

function Router({ currentLanguage, currentCurrency, setCurrentLanguage, setCurrentCurrency }: { 
  currentLanguage: string; 
  currentCurrency: string;
  setCurrentLanguage: (lang: string) => void;
  setCurrentCurrency: (curr: string) => void;
}) {
  return (
    <Switch>
      {/* Admin Routes - No Header/Footer */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/activities" component={AdminActivities} />
      <Route path="/admin/bookings" component={AdminBookings} />
      <Route path="/admin/translations" component={AdminTranslations} />
      <Route path="/admin/gallery" component={AdminGallery} />
      
      {/* Public Routes - With Header/Footer */}
      <Route path="/gallery">
        <div className="min-h-screen flex flex-col">
          <Header 
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            onLanguageChange={setCurrentLanguage}
            onCurrencyChange={setCurrentCurrency}
          />
          <main className="flex-1">
            <Gallery currentLanguage={currentLanguage} />
          </main>
          <Footer currentLanguage={currentLanguage} />
        </div>
      </Route>
      
      <Route path="/">
        <div className="min-h-screen flex flex-col">
          <Header 
            currentLanguage={currentLanguage}
            currentCurrency={currentCurrency}
            onLanguageChange={setCurrentLanguage}
            onCurrencyChange={setCurrentCurrency}
          />
          <main className="flex-1">
            <Home currentLanguage={currentLanguage} currentCurrency={currentCurrency} />
          </main>
          <Footer currentLanguage={currentLanguage} />
        </div>
      </Route>
      
      {/* 404 */}
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
        <Router 
          currentLanguage={currentLanguage} 
          currentCurrency={currentCurrency}
          setCurrentLanguage={setCurrentLanguage}
          setCurrentCurrency={setCurrentCurrency}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;