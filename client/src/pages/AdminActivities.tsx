import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Filter
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Activity {
  id: string;
  title: { en: string; fr: string; de: string; ar: string };
  description: { en: string; fr: string; de: string; ar: string };
  category: string;
  duration: string;
  groupSize: string;
  capacity: number;
  prices: { TND: number; USD: number; EUR: number };
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminActivities() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["/api/admin/activities"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/admin/activities");
      if (!response.ok) throw new Error("Failed to fetch activities");
      return await response.json() as Activity[];
    },
  });

  // Toggle activity status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await authenticatedApiRequest("PUT", `/api/admin/activities/${id}`, {
        isActive: !isActive
      });
      if (!response.ok) throw new Error("Failed to update activity status");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
      toast({
        title: "Activity Updated",
        description: "Activity status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update activity status",
        variant: "destructive",
      });
    },
  });

  // Delete activity mutation
  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await authenticatedApiRequest("DELETE", `/api/admin/activities/${id}`);
      if (!response.ok) throw new Error("Failed to delete activity");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
      toast({
        title: "Activity Deleted",
        description: "Activity has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete activity",
        variant: "destructive",
      });
    },
  });

  const handleToggleStatus = (activity: Activity) => {
    toggleStatusMutation.mutate({ id: activity.id, isActive: activity.isActive });
  };

  const handleDeleteActivity = (activity: Activity) => {
    if (confirm(`Are you sure you want to delete "${activity.title.en}"? This action cannot be undone.`)) {
      deleteActivityMutation.mutate(activity.id);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.title.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || activity.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(activities.map(a => a.category)));

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
            <h1 className="text-xl font-semibold">Activity Management</h1>
          </div>
          <Button 
            onClick={() => setLocation("/admin/activities/new")}
            data-testid="button-add-activity"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Activities Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all" 
                  ? "No activities match your search criteria"
                  : "No activities found. Create your first activity!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {activity.title.en}
                      </CardTitle>
                      <CardDescription>
                        {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)} • {activity.duration}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={activity.isActive ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {activity.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{activity.capacity} people</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Group Size:</span>
                      <span className="font-medium">{activity.groupSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price (TND):</span>
                      <span className="font-medium">{activity.prices.TND} TND</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/admin/activities/${activity.id}/edit`)}
                        data-testid={`button-edit-${activity.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(activity)}
                        data-testid={`button-toggle-${activity.id}`}
                      >
                        {activity.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity)}
                        className="text-destructive hover:text-destructive"
                        data-testid={`button-delete-${activity.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(activity.createdAt).toLocaleDateString()}
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