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
import { companyInfoSchema, contactInfoSchema, socialMediaSchema } from "@shared/schema";

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

type CompanyFormData = z.infer<typeof companyFormSchema>;
type ContactFormData = z.infer<typeof contactFormSchema>;
type SocialFormData = z.infer<typeof socialFormSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("company");

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
  }, [allSettings, companyForm, contactForm, socialForm]);

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="company" data-testid="tab-company">Company Info</TabsTrigger>
            <TabsTrigger value="contact" data-testid="tab-contact">Contact Details</TabsTrigger>
            <TabsTrigger value="social" data-testid="tab-social">Social Media</TabsTrigger>
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
                            <FormControl>
                              <Input {...field} placeholder="/logo.png" data-testid="input-logo-url" />
                            </FormControl>
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
        </Tabs>
      </div>
    </div>
  );
}