import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Search, 
  Filter,
  CalendarDays,
  Users,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BookingWithActivity {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingDate: string;
  groupSize: number;
  totalPrice: string;
  depositAmount: string;
  currency: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  specialRequests?: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  activity: {
    id: string;
    title: { en: string; fr: string; de: string; ar: string };
    category: string;
    duration: string;
  };
}

export default function AdminBookings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

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

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/admin/bookings");
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return await response.json() as BookingWithActivity[];
    },
  });

  // Update booking status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await authenticatedApiRequest("PUT", `/api/admin/bookings/${id}/status`, {
        status
      });
      if (!response.ok) throw new Error("Failed to update booking status");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({
        title: "Booking Updated",
        description: "Booking status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (booking: BookingWithActivity, newStatus: string) => {
    if (confirm(`Are you sure you want to ${newStatus} this booking for ${booking.customerName}?`)) {
      updateStatusMutation.mutate({ id: booking.id, status: newStatus });
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.activity.title.en.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || booking.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "cancelled": return "destructive";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  const getPaymentColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "fully_paid": return "default";
      case "deposit_paid": return "secondary";
      case "unpaid": return "destructive";
      case "refunded": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation("/admin/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold">Booking Management</h1>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer name, email, or activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48" data-testid="select-status">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full lg:w-48" data-testid="select-payment">
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                  <SelectItem value="fully_paid">Fully Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        {isLoading ? (
          <div className="text-center py-8">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                  ? "No bookings match your search criteria"
                  : "No bookings found"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <span>{booking.customerName}</span>
                        <Badge 
                          variant={getStatusColor(booking.status)}
                          className="text-xs"
                        >
                          {booking.status}
                        </Badge>
                        <Badge 
                          variant={getPaymentColor(booking.paymentStatus)}
                          className="text-xs"
                        >
                          {booking.paymentStatus.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{booking.customerEmail}</span>
                        </span>
                        {booking.customerPhone && (
                          <span className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{booking.customerPhone}</span>
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">
                        {booking.totalPrice} {booking.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Deposit: {booking.depositAmount} {booking.currency}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Activity Details</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{booking.activity.title.en}</span>
                          <Badge variant="outline" className="text-xs">
                            {booking.activity.category}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>{booking.groupSize} people</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Booking Info</h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">Language:</span> {booking.language.toUpperCase()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Booked:</span> {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                        {booking.paymentMethod && (
                          <div>
                            <span className="text-muted-foreground">Payment:</span> {booking.paymentMethod}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {booking.specialRequests && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center space-x-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>Special Requests</span>
                      </h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStatusUpdate(booking, "confirmed")}
                            data-testid={`button-confirm-${booking.id}`}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(booking, "cancelled")}
                            data-testid={`button-cancel-${booking.id}`}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(booking, "completed")}
                          data-testid={`button-complete-${booking.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ID: {booking.id.slice(0, 8)}...
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}