import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  CalendarDays, 
  Users, 
  TrendingUp, 
  Activity, 
  BookOpen, 
  LogOut,
  Settings
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Admin user type
interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
}

// Booking type with activity
interface BookingWithActivity {
  id: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  groupSize: number;
  totalPrice: string;
  depositAmount: string;
  currency: string;
  status: string;
  paymentStatus: string;
  language: string;
  createdAt: string;
  activity: {
    id: string;
    title: { en: string; fr: string; de: string; ar: string };
    category: string;
  };
}

// Activity type
interface Activity {
  id: string;
  title: { en: string; fr: string; de: string; ar: string };
  category: string;
  duration: string;
  capacity: number;
  prices: { TND: number; USD: number; EUR: number };
  isActive: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  // Check if user info is available (authentication handled by API 401 responses)
  useEffect(() => {
    const user = localStorage.getItem("admin_user");
    
    if (user) {
      try {
        setAdminUser(JSON.parse(user));
      } catch (error) {
        console.error("Error parsing admin user:", error);
        localStorage.removeItem("admin_user");
        setLocation("/admin/login");
      }
    }
    // Note: If no user info, we'll rely on 401 handling in API calls to redirect to login
  }, [setLocation]);

  // API helper with auth - using httpOnly cookies
  const authenticatedApiRequest = async (method: string, endpoint: string, body?: any) => {
    const options: RequestInit = {
      method,
      credentials: "include", // Include httpOnly cookies
      headers: {
        'Accept': 'application/json',
      },
    };
    
    if (method !== "GET" && body) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(endpoint, options);
    
    // Handle 401 by redirecting to login
    if (response.status === 401) {
      localStorage.removeItem("admin_user");
      setLocation("/admin/login");
      throw new Error("Unauthorized");
    }
    
    return response;
  };

  // Fetch activities
  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/admin/activities"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/admin/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");
      return await response.json() as Activity[];
    },
  });

  // Fetch bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/admin/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return await response.json() as BookingWithActivity[];
    },
  });

  const handleLogout = async () => {
    try {
      // Call server logout to clear httpOnly cookie
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      });
      
      // Clear any local storage
      localStorage.removeItem("admin_user");
      
      toast({
        title: "Logged Out", 
        description: "You have been successfully logged out",
      });
      
      setLocation("/admin/login");
    } catch (error) {
      // Even if server call fails, clear local state
      localStorage.removeItem("admin_user");
      setLocation("/admin/login");
    }
  };

  // Calculate dashboard stats
  const totalActivities = activities.length;
  const activeActivities = activities.filter(a => a.isActive).length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const confirmedBookings = bookings.filter(b => b.status === "confirmed").length;
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === "deposit_paid" || b.paymentStatus === "fully_paid")
    .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

  // Recent bookings (last 5)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (!adminUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Sghayra Tours Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Welcome back,</span>
              <span className="ml-1 font-medium">{adminUser.username}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {adminUser.role}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-activities">
                {totalActivities}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeActivities} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-bookings">
                {totalBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                {confirmedBookings} confirmed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="stat-pending-bookings">
                {pendingBookings}
              </div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="stat-total-revenue">
                {totalRevenue.toFixed(2)} TND
              </div>
              <p className="text-xs text-muted-foreground">
                From paid bookings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/activities")}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Manage Activities</span>
              </CardTitle>
              <CardDescription>
                Create, edit, and manage tourism activities and tours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {activitiesLoading ? "Loading..." : `${totalActivities} activities`}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/bookings")}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Manage Bookings</span>
              </CardTitle>
              <CardDescription>
                View and manage customer bookings and reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {bookingsLoading ? "Loading..." : `${totalBookings} bookings`}
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/translations")}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Translation Editor</span>
              </CardTitle>
              <CardDescription>
                Manage multilingual content for activities and tours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Edit content in 4 languages (EN/FR/DE/AR)
              </div>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => setLocation("/admin/gallery")}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gallery Management</span>
              </CardTitle>
              <CardDescription>
                Upload and manage photos and videos for the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Organize media content with object storage
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Latest customer reservations requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="text-center py-4">Loading bookings...</div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No bookings yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.activity.title.en} • {booking.groupSize} people
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium">
                        {booking.totalPrice} {booking.currency}
                      </div>
                      <Badge 
                        variant={
                          booking.status === "confirmed" ? "default" :
                          booking.status === "pending" ? "secondary" : "destructive"
                        }
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}