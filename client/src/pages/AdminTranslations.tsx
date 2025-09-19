import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Edit, 
  Save,
  X,
  Globe,
  Search,
  Languages
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  title: { en: string; fr: string; de: string; ar: string };
  description: { en: string; fr: string; de: string; ar: string };
  highlights: { en: string[]; fr: string[]; de: string[]; ar: string[] };
  category: string;
  duration: string;
  isActive: boolean;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇹🇳' },
];

export default function AdminTranslations() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [translations, setTranslations] = useState<any>({});

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
      const data = await response.json() as Activity[];
      
      // Initialize translations state
      const initialTranslations: any = {};
      data.forEach(activity => {
        initialTranslations[activity.id] = {
          title: { ...activity.title },
          description: { ...activity.description },
          highlights: { ...activity.highlights },
        };
      });
      setTranslations(initialTranslations);
      
      return data;
    },
  });

  // Update activity translations mutation
  const updateTranslationsMutation = useMutation({
    mutationFn: async ({ id, translations }: { id: string; translations: any }) => {
      const response = await authenticatedApiRequest("PUT", `/api/admin/activities/${id}`, translations);
      if (!response.ok) throw new Error("Failed to update translations");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/activities"] });
      toast({
        title: "Translations Updated",
        description: "Activity translations have been saved successfully",
      });
      setEditingActivity(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update translations",
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = (activityId: string) => {
    setEditingActivity(activityId);
  };

  const handleCancelEdit = () => {
    // Reset translations to original values
    const originalTranslations: any = {};
    activities.forEach(activity => {
      originalTranslations[activity.id] = {
        title: { ...activity.title },
        description: { ...activity.description },
        highlights: { ...activity.highlights },
      };
    });
    setTranslations(originalTranslations);
    setEditingActivity(null);
  };

  const handleSaveTranslations = (activityId: string) => {
    const activityTranslations = translations[activityId];
    if (activityTranslations) {
      updateTranslationsMutation.mutate({
        id: activityId,
        translations: activityTranslations,
      });
    }
  };

  const updateTranslation = (activityId: string, field: string, language: string, value: string) => {
    setTranslations((prev: any) => ({
      ...prev,
      [activityId]: {
        ...prev[activityId],
        [field]: {
          ...prev[activityId][field],
          [language]: value,
        },
      },
    }));
  };

  const updateHighlight = (activityId: string, language: string, index: number, value: string) => {
    setTranslations((prev: any) => {
      const highlights = [...(prev[activityId]?.highlights[language] || [])];
      highlights[index] = value;
      return {
        ...prev,
        [activityId]: {
          ...prev[activityId],
          highlights: {
            ...prev[activityId].highlights,
            [language]: highlights,
          },
        },
      };
    });
  };

  const addHighlight = (activityId: string, language: string) => {
    setTranslations((prev: any) => {
      const highlights = [...(prev[activityId]?.highlights[language] || [])];
      highlights.push("");
      return {
        ...prev,
        [activityId]: {
          ...prev[activityId],
          highlights: {
            ...prev[activityId].highlights,
            [language]: highlights,
          },
        },
      };
    });
  };

  const removeHighlight = (activityId: string, language: string, index: number) => {
    setTranslations((prev: any) => {
      const highlights = [...(prev[activityId]?.highlights[language] || [])];
      highlights.splice(index, 1);
      return {
        ...prev,
        [activityId]: {
          ...prev[activityId],
          highlights: {
            ...prev[activityId].highlights,
            [language]: highlights,
          },
        },
      };
    });
  };

  // Filter activities
  const filteredActivities = activities.filter(activity =>
    activity.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.title.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-xl font-semibold flex items-center space-x-2">
              <Languages className="h-5 w-5" />
              <span>Translation Editor</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities to translate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        {isLoading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm ? "No activities match your search" : "No activities found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredActivities.map((activity) => (
              <Card key={activity.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>{activity.title.en}</span>
                        <Badge variant="outline" className="text-xs">
                          {activity.category}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Manage translations for this activity across all languages
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {editingActivity === activity.id ? (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleSaveTranslations(activity.id)}
                            disabled={updateTranslationsMutation.isPending}
                            data-testid={`button-save-${activity.id}`}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            data-testid={`button-cancel-${activity.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(activity.id)}
                          data-testid={`button-edit-${activity.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Translations
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {editingActivity === activity.id ? (
                    <Tabs defaultValue="en" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        {languages.map(lang => (
                          <TabsTrigger key={lang.code} value={lang.code}>
                            <span className="mr-2">{lang.flag}</span>
                            {lang.name}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {languages.map(lang => (
                        <TabsContent key={lang.code} value={lang.code} className="space-y-4 mt-4">
                          <div className="space-y-4">
                            {/* Title */}
                            <div className="space-y-2">
                              <Label htmlFor={`title-${lang.code}`}>Title ({lang.name})</Label>
                              <Input
                                id={`title-${lang.code}`}
                                value={translations[activity.id]?.title[lang.code] || ''}
                                onChange={(e) => updateTranslation(activity.id, 'title', lang.code, e.target.value)}
                                placeholder={`Enter title in ${lang.name}`}
                              />
                            </div>
                            
                            {/* Description */}
                            <div className="space-y-2">
                              <Label htmlFor={`description-${lang.code}`}>Description ({lang.name})</Label>
                              <Textarea
                                id={`description-${lang.code}`}
                                value={translations[activity.id]?.description[lang.code] || ''}
                                onChange={(e) => updateTranslation(activity.id, 'description', lang.code, e.target.value)}
                                placeholder={`Enter description in ${lang.name}`}
                                rows={4}
                              />
                            </div>
                            
                            {/* Highlights */}
                            <div className="space-y-2">
                              <Label>Highlights ({lang.name})</Label>
                              <div className="space-y-2">
                                {(translations[activity.id]?.highlights[lang.code] || []).map((highlight: string, index: number) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <Input
                                      value={highlight}
                                      onChange={(e) => updateHighlight(activity.id, lang.code, index, e.target.value)}
                                      placeholder={`Highlight ${index + 1}`}
                                    />
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removeHighlight(activity.id, lang.code, index)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addHighlight(activity.id, lang.code)}
                                >
                                  Add Highlight
                                </Button>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {languages.map(lang => (
                        <div key={lang.code} className="space-y-2">
                          <h4 className="font-medium flex items-center space-x-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </h4>
                          <div className="text-sm space-y-1">
                            <div><strong>Title:</strong> {activity.title[lang.code as keyof typeof activity.title]}</div>
                            <div><strong>Description:</strong> {activity.description[lang.code as keyof typeof activity.description].substring(0, 100)}...</div>
                            <div><strong>Highlights:</strong> {activity.highlights[lang.code as keyof typeof activity.highlights].length} items</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}