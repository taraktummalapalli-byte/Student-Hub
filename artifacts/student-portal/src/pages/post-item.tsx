import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateItem, useUpdateItem, Item } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import type { ItemInputType } from "@workspace/api-client-react/src/generated/api.schemas";

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Books",
  "Keys",
  "Wallet",
  "ID/Cards",
  "Sports Equipment",
  "Other"
];

// This form handles both Create and Edit
export function ItemForm({ 
  initialData, 
  onSuccess,
  isEdit = false 
}: { 
  initialData?: Item;
  onSuccess?: () => void;
  isEdit?: boolean;
}) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || CATEGORIES[0],
    type: (initialData?.type || "Lost") as ItemInputType,
    location: initialData?.location || "",
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    contact: initialData?.contact || user?.email || "",
    image: initialData?.image || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);
  const [isUploading, setIsUploading] = useState(false);

  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image; // Return existing image if no new file
    
    setIsUploading(true);
    try {
      const form = new FormData();
      form.append("file", imageFile);
      
      const token = localStorage.getItem("auth_token");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error("Image upload error", err);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "There was a problem uploading your image. It may be too large."
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.location || !formData.date || !formData.contact) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields."
      });
      return;
    }

    let imageUrl = formData.image;
    if (imageFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl) return; // Stop if upload failed
      imageUrl = uploadedUrl;
    }

    const payload = {
      ...formData,
      image: imageUrl
    };

    if (isEdit && initialData) {
      updateMutation.mutate({ id: initialData.id, data: payload }, {
        onSuccess: () => {
          toast({ title: "Item updated successfully" });
          if (onSuccess) onSuccess();
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error updating item" });
        }
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: (data) => {
          toast({ title: "Item posted successfully" });
          if (onSuccess) {
            onSuccess();
          } else {
            setLocation(`/items/${data.id}`);
          }
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error posting item" });
        }
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending || isUploading;

  if (!isAuthenticated && !isEdit) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-display font-semibold mb-4">Sign in required</h2>
        <p className="text-muted-foreground mb-8">You need to be logged in to post an item.</p>
        <Button onClick={() => setLocation("/login")}>Log In</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="type">Report Type *</Label>
            <Select 
              value={formData.type} 
              onValueChange={(val: any) => setFormData(f => ({ ...f, type: val }))}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lost">I Lost Something</SelectItem>
                <SelectItem value="Found">I Found Something</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData(f => ({ ...f, category: val }))}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Item Title *</Label>
          <Input 
            id="title" 
            placeholder="e.g. Blue Hydroflask Water Bottle" 
            value={formData.title}
            onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <textarea
            id="description"
            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Describe the item in detail. Any distinguishing marks, stickers, damage?"
            value={formData.description}
            onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location">{formData.type === "Lost" ? "Last Seen Location *" : "Found Location *"}</Label>
            <Input 
              id="location" 
              placeholder="e.g. Library 2nd Floor, Main Quad..." 
              value={formData.location}
              onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date {formData.type === "Lost" ? "Lost" : "Found"} *</Label>
            <Input 
              id="date" 
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(f => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact">Contact Information *</Label>
          <Input 
            id="contact" 
            placeholder="Email or phone number" 
            value={formData.contact}
            onChange={(e) => setFormData(f => ({ ...f, contact: e.target.value }))}
            required
          />
          <p className="text-xs text-muted-foreground">How should people reach you about this item?</p>
        </div>

        <div className="space-y-2">
          <Label>Photo (Optional)</Label>
          
          {imagePreview ? (
            <div className="relative rounded-lg border overflow-hidden aspect-video max-w-sm bg-muted flex items-center justify-center">
              <img src={imagePreview} alt="Preview" className="max-h-full object-contain" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 rounded-full w-8 h-8"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setFormData(f => ({ ...f, image: "" }));
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full max-w-sm h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG or WEBP (Max 5MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        {!isEdit && (
          <Button type="button" variant="outline" onClick={() => setLocation("/")}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving..." : (isEdit ? "Update Item" : "Post Item")}
        </Button>
      </div>
    </form>
  );
}

export function PostItem() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Report an Item</h1>
          <p className="text-muted-foreground">Help keep our campus community connected by reporting lost or found items.</p>
        </div>
        
        <ItemForm />
      </div>
    </Layout>
  );
}
