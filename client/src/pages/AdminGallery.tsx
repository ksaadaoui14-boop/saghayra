import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Image,
  Video,
  ExternalLink
} from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface GalleryItem {
  id: string;
  title: { en: string; fr: string; de: string; ar: string };
  description: { en: string; fr: string; de: string; ar: string };
  type: string; // 'image' | 'video'
  url: string;
  thumbnailUrl?: string;
  category?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇹🇳' },
];

const categories = [
  "desert", "adventure", "cultural", "wildlife", "landscape", "people", "sunset", "camp", "general"
];

export default function AdminGallery() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newItemData, setNewItemData] = useState({
    url: "",
    type: "image",
    category: "general",
    title: { en: "", fr: "", de: "", ar: "" },
    description: { en: "", fr: "", de: "", ar: "" },
  });

  // Upload helper function
  const handleFileUploadComplete = (result: { fileUrl: string; fileName: string; fileType: string }) => {
    // Update the URL field and determine type
    const fileType = result.fileType === 'videos' ? 'video' : 'image';
    setNewItemData(prev => ({
      ...prev,
      url: result.fileUrl,
      type: fileType
    }));
  };

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

  // Fetch gallery items
  const { data: galleryItems = [], isLoading } = useQuery({
    queryKey: ["/api/admin/gallery"],
    queryFn: async () => {
      const response = await authenticatedApiRequest("GET", "/api/admin/gallery");
      if (!response.ok) throw new Error("Failed to fetch gallery items");
      return await response.json() as GalleryItem[];
    },
  });

  // Create gallery item mutation
  const createGalleryItemMutation = useMutation({
    mutationFn: async (itemData: any) => {
      const response = await authenticatedApiRequest("POST", "/api/admin/gallery", itemData);
      if (!response.ok) throw new Error("Failed to create gallery item");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({
        title: "Gallery Item Created",
        description: "Gallery item has been added successfully",
      });
      setShowUploadDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create gallery item",
        variant: "destructive",
      });
    },
  });

  // Update gallery item mutation
  const updateGalleryItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await authenticatedApiRequest("PUT", `/api/admin/gallery/${id}`, data);
      if (!response.ok) throw new Error("Failed to update gallery item");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({
        title: "Gallery Item Updated",
        description: "Gallery item has been updated successfully",
      });
      setEditingItem(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update gallery item",
        variant: "destructive",
      });
    },
  });

  // Delete gallery item mutation
  const deleteGalleryItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await authenticatedApiRequest("DELETE", `/api/admin/gallery/${id}`);
      if (!response.ok) throw new Error("Failed to delete gallery item");
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/gallery"] });
      toast({
        title: "Gallery Item Deleted",
        description: "Gallery item has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete gallery item",
        variant: "destructive",
      });
    },
  });

  const handleToggleActive = (item: GalleryItem) => {
    updateGalleryItemMutation.mutate({
      id: item.id,
      data: { isActive: !item.isActive }
    });
  };

  const handleDelete = (item: GalleryItem) => {
    if (confirm(`Are you sure you want to delete "${item.title.en}"?`)) {
      deleteGalleryItemMutation.mutate(item.id);
    }
  };

  // Filter gallery items
  const filteredItems = galleryItems.filter(item => {
    const matchesSearch = 
      item.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.fr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    return type === 'video' ? <Video className="h-4 w-4" /> : <Image className="h-4 w-4" />;
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
            <h1 className="text-xl font-semibold">Gallery Management</h1>
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Add Gallery Item</DialogTitle>
                <DialogDescription>
                  Upload your files and add details below.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-auto flex-1 pr-2">
                <UploadForm 
                  onSubmit={createGalleryItemMutation.mutate}
                  isLoading={createGalleryItemMutation.isPending}
                  newItemData={newItemData}
                  setNewItemData={setNewItemData}
                  handleFileUploadComplete={handleFileUploadComplete}
                />
              </div>
            </DialogContent>
          </Dialog>
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
                    placeholder="Search by title or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full lg:w-48" data-testid="select-category">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-48" data-testid="select-type">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Grid */}
        {isLoading ? (
          <div className="text-center py-8">Loading gallery items...</div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all" || typeFilter !== "all"
                  ? "No gallery items match your search criteria"
                  : "No gallery items found. Upload your first item to get started!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover-elevate overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.title.en}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjNmNGY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkw4IDEyTDEwIDEwTDEyIDEyTDE2IDhMMjAgMTJWMTZIMTJaIiBmaWxsPSIjOWNhM2FmIi8+CjwvcHZnPgo=';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Video className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTypeIcon(item.type)}
                      <span className="ml-1">{item.type}</span>
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm line-clamp-2">{item.title.en}</h3>
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(item)}
                          data-testid={`button-toggle-${item.id}`}
                        >
                          {item.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingItem(item)}
                          data-testid={`button-edit-${item.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          data-testid={`button-delete-${item.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Edit Gallery Item</DialogTitle>
              <DialogDescription>
                Update the gallery item details.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-auto flex-1 pr-2">
              <EditForm 
                item={editingItem}
                onSubmit={(data) => updateGalleryItemMutation.mutate({ id: editingItem.id, data })}
                isLoading={updateGalleryItemMutation.isPending}
                onCancel={() => setEditingItem(null)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Upload Form Component
function UploadForm({ 
  onSubmit, 
  isLoading, 
  newItemData, 
  setNewItemData, 
  handleFileUploadComplete 
}: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
  newItemData: any;
  setNewItemData: (data: any) => void;
  handleFileUploadComplete: (result: { fileUrl: string; fileName: string; fileType: string }) => void;
}) {
  const [formData, setFormData] = useState({
    type: newItemData.type || 'image',
    url: newItemData.url || '',
    thumbnailUrl: '',
    category: newItemData.category || '',
    title: newItemData.title || { en: '', fr: '', de: '', ar: '' },
    description: newItemData.description || { en: '', fr: '', de: '', ar: '' },
    sortOrder: 0
  });

  // Update form data when newItemData changes (from upload)
  useEffect(() => {
    if (newItemData.url) {
      setFormData(prev => ({
        ...prev,
        url: newItemData.url,
        type: newItemData.type || prev.type,
      }));
    }
  }, [newItemData.url, newItemData.type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="type" className="text-sm">Type</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Image</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category" className="text-sm">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url" className="text-sm">Gallery File</Label>
        <Input
          id="url"
          value={formData.url}
          onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
          placeholder="File URL or upload below"
          required
          className="h-8"
        />
        <ObjectUploader
          maxNumberOfFiles={1}
          maxFileSize={formData.type === 'video' ? 104857600 : 10485760} // 100MB for videos, 10MB for images
          allowedFileTypes={formData.type === 'video' 
            ? ['video/mp4', 'video/webm', 'video/quicktime'] 
            : ['image/jpeg', 'image/png', 'image/webp']
          }
          onComplete={handleFileUploadComplete}
          buttonClassName="w-full h-8"
          data-testid="button-upload-gallery-file"
        >
          <Upload className="h-3 w-3 mr-2" />
          Upload {formData.type === 'video' ? 'Video' : 'Image'}
        </ObjectUploader>
        {formData.url && (
          <div className="text-xs text-muted-foreground truncate">
            Current: {formData.url}
          </div>
        )}
      </div>

      {formData.type === 'video' && (
        <div>
          <Label htmlFor="thumbnailUrl" className="text-sm">Thumbnail URL (Optional)</Label>
          <Input
            id="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, thumbnailUrl: e.target.value }))}
            placeholder="https://your-object-storage-url/thumbnail.jpg"
            className="h-8"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {languages.map(lang => (
            <div key={lang.code}>
              <Label htmlFor={`title-${lang.code}`} className="text-sm">Title ({lang.name}) *</Label>
              <Input
                id={`title-${lang.code}`}
                value={formData.title[lang.code as keyof typeof formData.title]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  title: { ...prev.title, [lang.code]: e.target.value }
                }))}
                required
                data-testid={`input-title-${lang.code}`}
                className="h-8"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {languages.map(lang => (
            <div key={lang.code}>
              <Label htmlFor={`desc-${lang.code}`} className="text-sm">Description ({lang.name})</Label>
              <Textarea
                id={`desc-${lang.code}`}
                value={formData.description[lang.code as keyof typeof formData.description]}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  description: { ...prev.description, [lang.code]: e.target.value }
                }))}
                rows={2}
                data-testid={`textarea-description-${lang.code}`}
                className="text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="submit" disabled={isLoading} data-testid="button-create-gallery-item" className="h-8">
          {isLoading ? "Creating..." : "Create Gallery Item"}
        </Button>
      </div>
    </form>
  );
}

// Edit Form Component  
function EditForm({ item, onSubmit, isLoading, onCancel }: { 
  item: GalleryItem; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    title: item.title,
    description: item.description,
    category: item.category || '',
    isActive: item.isActive,
    sortOrder: item.sortOrder
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>

      {languages.map(lang => (
        <div key={lang.code}>
          <Label htmlFor={`title-${lang.code}`}>Title ({lang.name}) *</Label>
          <Input
            id={`title-${lang.code}`}
            value={formData.title[lang.code as keyof typeof formData.title]}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              title: { ...prev.title, [lang.code]: e.target.value }
            }))}
            required
          />
        </div>
      ))}

      {languages.map(lang => (
        <div key={lang.code}>
          <Label htmlFor={`desc-${lang.code}`}>Description ({lang.name})</Label>
          <Textarea
            id={`desc-${lang.code}`}
            value={formData.description[lang.code as keyof typeof formData.description]}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              description: { ...prev.description, [lang.code]: e.target.value }
            }))}
            rows={3}
          />
        </div>
      ))}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Gallery Item"}
        </Button>
      </div>
    </form>
  );
}