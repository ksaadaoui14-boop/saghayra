import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { companyInfoSchema, contactInfoSchema, socialMediaSchema, bookingInfoSchema, locationInfoSchema } from "@shared/schema";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Upload, Image, Video, FileText, MapPin } from "lucide-react";
import type { UploadResult } from "@uppy/core";

// Form schemas derived from shared schemas to ensure consistency
const companyFormSchema = companyInfoSchema.extend({
  isActive: z.boolean().default(true)
}).partial({ tagline: true }); // Make tagline optional to match server

const contactFormSchema = contactInfoSchema.extend({
  isActive: z.boolean().default(true)
});

const socialFormSchema = socialMediaSchema.extend({
  isActive: z.boolean().default(true)
});

const bookingFormSchema = bookingInfoSchema.extend({
  isActive: z.boolean().default(true)
});

const locationFormSchema = locationInfoSchema.extend({
  isActive: z.boolean().default(true)
});

type CompanyFormData = z.infer<typeof companyFormSchema>;
type ContactFormData = z.infer<typeof contactFormSchema>;
type SocialFormData = z.infer<typeof socialFormSchema>;
type BookingFormData = z.infer<typeof bookingFormSchema>;
type LocationFormData = z.infer<typeof locationFormSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Upload helper functions
  const handleGetUploadParameters = async () => {
    const response = await fetch('/api/admin/objects/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }
    
    const data = await response.json();
    return {
      method: 'PUT' as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      if (result.successful && result.successful.length > 0) {
        const objectPaths: string[] = [];
        
        // Process all successfully uploaded files
        for (const uploadedFile of result.successful) {
          const fileURL = uploadedFile.uploadURL;
          
          // Set ACL policy for the uploaded file
          const response = await fetch('/api/admin/objects', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              fileURL: fileURL,
              visibility: 'public',
              fileType: uploadedFile.type || 'file'
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to process uploaded file: ${uploadedFile.name}`);
          }

          const data = await response.json();
          const objectPath = data.objectPath;
          objectPaths.push(objectPath);
        }
        
        setUploadedFiles(prev => [...prev, ...objectPaths]);
        
        toast({
          title: "Upload Successful",
          description: `${result.successful.length} file(s) uploaded successfully`,
        });

        return objectPaths;
      }
    } catch (error) {
      console.error('Error processing upload:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process uploaded file",
        variant: "destructive",
      });
    }
  };

  const handleLogoUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    const objectPaths = await handleUploadComplete(result);
    if (objectPaths && objectPaths.length > 0) {
      // Update the logo URL field with the first uploaded file
      companyForm.setValue('logoUrl', objectPaths[0]);
      toast({
        title: "Logo Updated",
        description: "Logo uploaded successfully and form updated",
      });
    }
  };

  // Fetch all settings
  const { data: allSettings, isLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
  });

  // Company Info Form
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: { en: "", fr: "", de: "", ar: "" },
      tagline: { en: "", fr: "", de: "", ar: "" },
      about: { en: "", fr: "", de: "", ar: "" },
      logoUrl: "",
      faviconUrl: "",
      isActive: true
    }
  });

  // Contact Details Form
  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      phone: "",
      email: "",
      whatsapp: "",
      address: { en: "", fr: "", de: "", ar: "" },
      isActive: true
    }
  });

  // Social Media Form
  const socialForm = useForm<SocialFormData>({
    resolver: zodResolver(socialFormSchema),
    defaultValues: {
      facebook: "",
      instagram: "",
      twitter: "",
      isActive: true
    }
  });

  // Booking Settings Form
  const bookingForm = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      termsAndConditions: { en: "", fr: "", de: "", ar: "" },
      privacyPolicy: { en: "", fr: "", de: "", ar: "" },
      cancellationPolicy: { en: "", fr: "", de: "", ar: "" },
      bookingInstructions: { en: "", fr: "", de: "", ar: "" },
      contactEmail: "",
      contactPhone: "",
      depositPercentage: 10,
      isBookingEnabled: true,
      isActive: true
    }
  });

  // Location Info Form
  const locationForm = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      address: { en: "", fr: "", de: "", ar: "" },
      latitude: 0,
      longitude: 0,
      googleMapsUrl: "",
      displayOnFooter: true,
      displayOnContact: true,
      isActive: true
    }
  });

  // Update forms when data loads
  useEffect(() => {
    const settingsData = allSettings as Record<string, any> || {};
    
    if (settingsData.company_info) {
      const { type, ...companyData } = settingsData.company_info;
      companyForm.reset({ ...companyData, isActive: settingsData.company_info.isActive ?? true });
    }
    if (settingsData.contact_details) {
      const { type, ...contactData } = settingsData.contact_details;
      contactForm.reset({ ...contactData, isActive: settingsData.contact_details.isActive ?? true });
    }
    if (settingsData.social_media) {
      const { type, ...socialData } = settingsData.social_media;
      socialForm.reset({ ...socialData, isActive: settingsData.social_media.isActive ?? true });
    }
    if (settingsData.booking_info) {
      const { type, ...bookingData } = settingsData.booking_info;
      bookingForm.reset({ ...bookingData, isActive: settingsData.booking_info.isActive ?? true });
    }
    if (settingsData.location_info) {
      const { type, ...locationData } = settingsData.location_info;
      locationForm.reset({ ...locationData, isActive: settingsData.location_info.isActive ?? true });
    }
  }, [allSettings, companyForm, contactForm, socialForm, bookingForm, locationForm]);

  // Mutations for updating settings
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: CompanyFormData) => {
      const { isActive, ...value } = data;
      const valueWithType = { type: "company_info", ...value };
      return apiRequest("PUT", "/api/admin/settings/company_info", { value: valueWithType, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      // Force refetch by removing from cache completely
      queryClient.removeQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Company information updated successfully" });
    },
    onError: async (error: any) => {
      console.error("Company update error:", error);
      
      // Try to parse server validation details
      let errorMessage = "Failed to update company information";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive" 
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const { isActive, ...value } = data;
      const valueWithType = { type: "contact_details", ...value };
      return apiRequest("PUT", "/api/admin/settings/contact_details", { value: valueWithType, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      // Force refetch by removing from cache completely
      queryClient.removeQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Contact details updated successfully" });
    },
    onError: async (error: any) => {
      console.error("Contact update error:", error);
      
      // Try to parse server validation details
      let errorMessage = "Failed to update contact details";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive" 
      });
    }
  });

  const updateSocialMutation = useMutation({
    mutationFn: async (data: SocialFormData) => {
      const { isActive, ...value } = data;
      const valueWithType = { type: "social_media", ...value };
      return apiRequest("PUT", "/api/admin/settings/social_media", { value: valueWithType, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      // Force refetch by removing from cache completely
      queryClient.removeQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Social media settings updated successfully" });
    },
    onError: async (error: any) => {
      console.error("Social media update error:", error);
      
      // Try to parse server validation details
      let errorMessage = "Failed to update social media settings";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive" 
      });
    }
  });

  const updateBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const { isActive, ...value } = data;
      const valueWithType = { type: "booking_info", ...value };
      return apiRequest("PUT", "/api/admin/settings/booking_info", { value: valueWithType, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      // Force refetch by removing from cache completely
      queryClient.removeQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Booking settings updated successfully" });
    },
    onError: async (error: any) => {
      console.error("Booking settings update error:", error);
      
      // Try to parse server validation details
      let errorMessage = "Failed to update booking settings";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: "Error", 
        description: errorMessage,
        variant: "destructive" 
      });
    }
  });

  const updateLocationMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      const { isActive, ...value } = data;
      const valueWithType = { type: "location_info", ...value };
      return apiRequest("PUT", "/api/admin/settings/location_info", { value: valueWithType, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.removeQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Location information updated successfully" });
    },
    onError: (error: any) => {
      console.error("Location update error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update location information",
        variant: "destructive" 
      });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-muted-foreground">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              ← Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Site Settings</h1>
              <p className="text-muted-foreground">Manage your website content and configuration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="company" data-testid="tab-company">Company Info</TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-contact">Contact Details</TabsTrigger>
            <TabsTrigger value="location" data-testid="tab-location">Location</TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-social">Social Media</TabsTrigger>
            <TabsTrigger value="booking" data-testid="tab-booking">Booking Settings</TabsTrigger>
            <TabsTrigger value="media" data-testid="tab-media">Media Management</TabsTrigger>
          </TabsList>

          {/* Company Info Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit((data) => updateCompanyMutation.mutate(data))} className="space-y-6">
                    <FormField
                      control={companyForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Company Information</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Make company information visible on the website
                            </div>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              data-testid="switch-company-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Company Name */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Company Name</h3>
                        <FormField
                          control={companyForm.control}
                          name="name.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Company name in English" data-testid="input-company-name-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="name.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Nom de l'entreprise en français" data-testid="input-company-name-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="name.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Firmenname auf Deutsch" data-testid="input-company-name-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="name.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="اسم الشركة بالعربية" dir="rtl" data-testid="input-company-name-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Tagline */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Tagline</h3>
                        <FormField
                          control={companyForm.control}
                          name="tagline.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Company tagline in English" data-testid="input-tagline-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="tagline.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Slogan de l'entreprise en français" data-testid="input-tagline-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="tagline.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Firmen-Slogan auf Deutsch" data-testid="input-tagline-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="tagline.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="شعار الشركة بالعربية" dir="rtl" data-testid="input-tagline-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="space-y-4">
                      <h3 className="font-medium">About Description</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={companyForm.control}
                          name="about.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Company description in English"
                                  className="min-h-[100px]"
                                  data-testid="textarea-about-en"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="about.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Description de l'entreprise en français"
                                  className="min-h-[100px]"
                                  data-testid="textarea-about-fr"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="about.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Firmenbeschreibung auf Deutsch"
                                  className="min-h-[100px]"
                                  data-testid="textarea-about-de"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={companyForm.control}
                          name="about.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="وصف الشركة بالعربية"
                                  className="min-h-[100px]"
                                  dir="rtl"
                                  data-testid="textarea-about-ar"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Logo and Favicon */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={companyForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <div className="space-y-2">
                              <FormControl>
                                <Input {...field} placeholder="/logo.png" data-testid="input-logo-url" />
                              </FormControl>
                              <ObjectUploader
                                maxNumberOfFiles={1}
                                maxFileSize={5242880} // 5MB
                                allowedFileTypes={['.jpg', '.jpeg', '.png', '.webp', '.gif']}
                                onGetUploadParameters={handleGetUploadParameters}
                                onComplete={handleLogoUploadComplete}
                                buttonClassName="w-full"
                                data-testid="button-upload-logo"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Logo
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
                      <FormField
                        control={companyForm.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="/favicon.ico" data-testid="input-favicon-url" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={updateCompanyMutation.isPending} data-testid="button-save-company">
                      {updateCompanyMutation.isPending ? "Saving..." : "Save Company Information"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Details Tab */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit((data) => updateContactMutation.mutate(data))} className="space-y-6">
                    <FormField
                      control={contactForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Contact Information</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Make contact information visible on the website
                            </div>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              data-testid="switch-contact-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={contactForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+216 98 123 456" data-testid="input-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="info@company.com" type="email" data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={contactForm.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WhatsApp Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+216 98 123 456" data-testid="input-whatsapp" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={contactForm.control}
                          name="address.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Address in English" data-testid="input-address-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="address.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Adresse en français" data-testid="input-address-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="address.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Adresse auf Deutsch" data-testid="input-address-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={contactForm.control}
                          name="address.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="العنوان بالعربية" dir="rtl" data-testid="input-address-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={updateContactMutation.isPending} data-testid="button-save-contact">
                      {updateContactMutation.isPending ? "Saving..." : "Save Contact Information"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your company's physical location and map integration.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...locationForm}>
                  <form onSubmit={locationForm.handleSubmit((data) => updateLocationMutation.mutate(data))} className="space-y-6">
                    <FormField
                      control={locationForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Location Display</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Show location information on website footer and contact pages
                            </div>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              data-testid="switch-location-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Address Section */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Address</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={locationForm.control}
                          name="address.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Complete address in English" rows={3} data-testid="input-address-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={locationForm.control}
                          name="address.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Adresse complète en français" rows={3} data-testid="input-address-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={locationForm.control}
                          name="address.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Vollständige Adresse auf Deutsch" rows={3} data-testid="input-address-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={locationForm.control}
                          name="address.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="العنوان الكامل بالعربية" dir="rtl" rows={3} data-testid="input-address-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Coordinates Section */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Map Coordinates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={locationForm.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="any" 
                                  placeholder="33.8869" 
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-latitude" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={locationForm.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="any" 
                                  placeholder="9.5375" 
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  data-testid="input-longitude" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get coordinates from Google Maps by right-clicking on your location and selecting coordinates.
                      </p>
                    </div>

                    {/* Optional Google Maps URL */}
                    <FormField
                      control={locationForm.control}
                      name="googleMapsUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Maps URL (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://maps.google.com/..." data-testid="input-google-maps-url" />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-muted-foreground">
                            Link to your business on Google Maps for additional information.
                          </p>
                        </FormItem>
                      )}
                    />

                    {/* Display Options */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Display Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={locationForm.control}
                          name="displayOnFooter"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Show in Footer</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Display location in website footer
                                </div>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-display-footer"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={locationForm.control}
                          name="displayOnContact"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel>Show on Contact Page</FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Display location on contact page
                                </div>
                              </div>
                              <FormControl>
                                <Switch 
                                  checked={field.value} 
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-display-contact"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={updateLocationMutation.isPending} data-testid="button-save-location">
                      {updateLocationMutation.isPending ? "Saving..." : "Save Location Information"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...socialForm}>
                  <form onSubmit={socialForm.handleSubmit((data) => updateSocialMutation.mutate(data))} className="space-y-6">
                    <FormField
                      control={socialForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Social Media Links</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Make social media links visible on the website
                            </div>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              data-testid="switch-social-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={socialForm.control}
                        name="facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://facebook.com/yourcompany" data-testid="input-facebook" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={socialForm.control}
                        name="instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://instagram.com/yourcompany" data-testid="input-instagram" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={socialForm.control}
                        name="twitter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://twitter.com/yourcompany" data-testid="input-twitter" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={updateSocialMutation.isPending} data-testid="button-save-social">
                      {updateSocialMutation.isPending ? "Saving..." : "Save Social Media Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Booking Settings Tab */}
          <TabsContent value="booking">
            <Card>
              <CardHeader>
                <CardTitle>Booking Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...bookingForm}>
                  <form onSubmit={bookingForm.handleSubmit((data) => updateBookingMutation.mutate(data))} className="space-y-6">
                    <FormField
                      control={bookingForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Booking System</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Make the booking system available to customers
                            </div>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              data-testid="switch-booking-active"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={bookingForm.control}
                      name="isBookingEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Accept New Bookings</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Allow customers to make new bookings
                            </div>
                          </div>
                          <FormControl>
                            <Switch 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              data-testid="switch-booking-enabled"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={bookingForm.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="bookings@example.com" data-testid="input-contact-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookingForm.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+216 12 345 678" data-testid="input-contact-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookingForm.control}
                        name="depositPercentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deposit Percentage</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="1" 
                                max="100" 
                                placeholder="10" 
                                data-testid="input-deposit-percentage"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Terms and Conditions</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={bookingForm.control}
                          name="termsAndConditions.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Terms and conditions in English..." rows={4} data-testid="textarea-terms-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="termsAndConditions.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Conditions générales en français..." rows={4} data-testid="textarea-terms-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="termsAndConditions.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Geschäftsbedingungen auf Deutsch..." rows={4} data-testid="textarea-terms-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="termsAndConditions.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="الشروط والأحكام باللغة العربية..." rows={4} data-testid="textarea-terms-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Privacy Policy */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Privacy Policy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={bookingForm.control}
                          name="privacyPolicy.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Privacy policy in English..." rows={4} data-testid="textarea-privacy-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="privacyPolicy.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Politique de confidentialité en français..." rows={4} data-testid="textarea-privacy-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="privacyPolicy.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Datenschutzerklärung auf Deutsch..." rows={4} data-testid="textarea-privacy-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="privacyPolicy.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="سياسة الخصوصية باللغة العربية..." rows={4} data-testid="textarea-privacy-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Cancellation Policy</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={bookingForm.control}
                          name="cancellationPolicy.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Cancellation policy in English..." rows={4} data-testid="textarea-cancellation-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="cancellationPolicy.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Politique d'annulation en français..." rows={4} data-testid="textarea-cancellation-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="cancellationPolicy.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Stornierungsrichtlinie auf Deutsch..." rows={4} data-testid="textarea-cancellation-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="cancellationPolicy.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="سياسة الإلغاء باللغة العربية..." rows={4} data-testid="textarea-cancellation-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Booking Instructions */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Booking Instructions (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={bookingForm.control}
                          name="bookingInstructions.en"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>English</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Special instructions for customers..." rows={3} data-testid="textarea-instructions-en" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="bookingInstructions.fr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>French</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Instructions spéciales pour les clients..." rows={3} data-testid="textarea-instructions-fr" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="bookingInstructions.de"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>German</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Besondere Anweisungen für Kunden..." rows={3} data-testid="textarea-instructions-de" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={bookingForm.control}
                          name="bookingInstructions.ar"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Arabic</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="تعليمات خاصة للعملاء..." rows={3} data-testid="textarea-instructions-ar" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <Button type="submit" disabled={updateBookingMutation.isPending} data-testid="button-save-booking">
                      {updateBookingMutation.isPending ? "Saving..." : "Save Booking Settings"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Management Tab */}
          <TabsContent value="media">
            <div className="space-y-6">
              {/* Photos Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Photo Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage photos for activities, galleries, and other content. Supported formats: JPG, PNG, WebP.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ObjectUploader
                      maxNumberOfFiles={10}
                      maxFileSize={10485760} // 10MB
                      allowedFileTypes={['.jpg', '.jpeg', '.png', '.webp']}
                      onGetUploadParameters={handleGetUploadParameters}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full"
                      data-testid="button-upload-photos"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photos
                    </ObjectUploader>
                    
                    {uploadedFiles.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Recently Uploaded Files</h4>
                        <div className="space-y-2">
                          {uploadedFiles.slice(-5).map((filePath, index) => (
                            <div key={index} className="flex items-center justify-between bg-muted p-3 rounded border">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{filePath.split('/').pop()}</div>
                                <code className="text-xs text-muted-foreground break-all">{filePath}</code>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(filePath);
                                  toast({
                                    title: "Copied!",
                                    description: "File path copied to clipboard",
                                  });
                                }}
                                className="ml-2 flex-shrink-0"
                              >
                                Copy Path
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Videos Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Video Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload and manage video content. Supported formats: MP4, WebM, MOV.
                  </p>
                </CardHeader>
                <CardContent>
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={104857600} // 100MB
                    allowedFileTypes={['.mp4', '.webm', '.mov']}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                    data-testid="button-upload-videos"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Videos
                  </ObjectUploader>
                </CardContent>
              </Card>

              {/* Documents Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Management
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Upload documents, PDFs, and other files. Supported formats: PDF, DOC, DOCX, TXT.
                  </p>
                </CardHeader>
                <CardContent>
                  <ObjectUploader
                    maxNumberOfFiles={10}
                    maxFileSize={20971520} // 20MB
                    allowedFileTypes={['.pdf', '.doc', '.docx', '.txt']}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                    data-testid="button-upload-documents"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                  </ObjectUploader>
                </CardContent>
              </Card>

              {/* Usage Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Use Uploaded Files</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium">Using Files in Content</h4>
                      <p className="text-muted-foreground">
                        After uploading files, you can reference them in your activity descriptions, company information, and other content areas using the provided file paths.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Logo Updates</h4>
                      <p className="text-muted-foreground">
                        Uploaded logo images can be automatically used by copying the file path to the Logo URL field in the Company Info tab.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">File Security</h4>
                      <p className="text-muted-foreground">
                        All uploaded files are stored securely with proper access controls. Public files are accessible for website display, while private files require authentication.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}