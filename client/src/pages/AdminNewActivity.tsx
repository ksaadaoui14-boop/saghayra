import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Form schema
const newActivitySchema = z.object({
  category: z.string().min(1, "Category is required"),
  duration: z.string().min(1, "Duration is required"),
  groupSize: z.string().min(1, "Group size is required"),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  title: z.object({
    en: z.string().min(1, "English title is required"),
    fr: z.string().min(1, "French title is required"),
    de: z.string().min(1, "German title is required"),
    ar: z.string().min(1, "Arabic title is required"),
  }),
  description: z.object({
    en: z.string().min(1, "English description is required"),
    fr: z.string().min(1, "French description is required"),
    de: z.string().min(1, "German description is required"),
    ar: z.string().min(1, "Arabic description is required"),
  }),
  highlights: z.object({
    en: z.array(z.string()).default([]),
    fr: z.array(z.string()).default([]),
    de: z.array(z.string()).default([]),
    ar: z.array(z.string()).default([]),
  }),
  prices: z.object({
    TND: z.number().min(0, "TND price must be non-negative"),
    USD: z.number().min(0, "USD price must be non-negative"),
    EUR: z.number().min(0, "EUR price must be non-negative"),
  }),
});

type NewActivityFormData = z.infer<typeof newActivitySchema>;

const categories = [
  "Desert Adventure",
  "Cultural Experience", 
  "Camel Trekking",
  "Camping",
  "Photography Tour",
  "Traditional Dining",
  "Stargazing",
  "Sandboarding"
];

export default function AdminNewActivity() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload helper function
  const handleImageUploadComplete = (result: { fileUrl: string; fileName: string; fileType: string }) => {
    // Update the image URL field
    form.setValue('imageUrl', result.fileUrl);
    
    toast({
      title: "Image Uploaded",
      description: "Activity image uploaded successfully",
    });
  };

  const form = useForm<NewActivityFormData>({
    resolver: zodResolver(newActivitySchema),
    defaultValues: {
      category: "",
      duration: "",
      groupSize: "",
      imageUrl: "",
      isActive: true,
      title: { en: "", fr: "", de: "", ar: "" },
      description: { en: "", fr: "", de: "", ar: "" },
      highlights: { en: [], fr: [], de: [], ar: [] },
      prices: { TND: 0, USD: 0, EUR: 0 },
    },
  });

  // API helper with auth
  const authenticatedApiRequest = async (method: string, endpoint: string, body?: any) => {
    const options: RequestInit = {
      method,
      credentials: "include",
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
    
    if (response.status === 401) {
      localStorage.removeItem("admin_user");
      setLocation("/admin/login");
      throw new Error("Unauthorized");
    }
    
    return response;
  };

  const createActivityMutation = useMutation({
    mutationFn: async (data: NewActivityFormData) => {
      const response = await authenticatedApiRequest("POST", "/api/admin/activities", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || "Failed to create activity");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Activity created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
      setLocation("/admin/activities");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewActivityFormData) => {
    createActivityMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setLocation("/admin/activities")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Activity</h1>
            <p className="text-muted-foreground">Add a new tourism activity to your offerings</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2 hours, Full day" data-testid="input-duration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="groupSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group Size</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2-8 people, Up to 15" data-testid="input-group-size" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Image</FormLabel>
                        <div className="space-y-2">
                          <FormControl>
                            <Input {...field} placeholder="Image URL or upload below" data-testid="input-image-url" />
                          </FormControl>
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760} // 10MB
                            allowedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                            onComplete={handleImageUploadComplete}
                            buttonClassName="w-full"
                            data-testid="button-upload-activity-image"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Activity Image
                          </ObjectUploader>
                          {field.value && (
                            <div className="text-sm text-muted-foreground">
                              Current: {field.value}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Make this activity visible to customers
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Titles */}
            <Card>
              <CardHeader>
                <CardTitle>Titles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>English</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Activity title in English" data-testid="input-title-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title.fr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>French</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Titre de l'activité en français" data-testid="input-title-fr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title.de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>German</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Aktivitätstitel auf Deutsch" data-testid="input-title-de" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arabic</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="عنوان النشاط بالعربية" dir="rtl" data-testid="input-title-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Descriptions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>English</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Detailed description in English" rows={4} data-testid="textarea-description-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description.fr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>French</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Description détaillée en français" rows={4} data-testid="textarea-description-fr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description.de"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>German</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Detaillierte Beschreibung auf Deutsch" rows={4} data-testid="textarea-description-de" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Arabic</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="وصف مفصل بالعربية" rows={4} dir="rtl" data-testid="textarea-description-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="prices.TND"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price in TND</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-price-tnd" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prices.USD"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price in USD</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-price-usd" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prices.EUR"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price in EUR</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0" 
                            step="0.01"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            data-testid="input-price-eur" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setLocation("/admin/activities")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createActivityMutation.isPending}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                {createActivityMutation.isPending ? "Creating..." : "Create Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}