import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onComplete?: (result: { fileUrl: string; fileName: string; fileType: string }) => void;
  buttonClassName?: string;
  children: ReactNode;
  "data-testid"?: string;
}

/**
 * A file upload component that renders as a button and handles file uploads to local storage.
 * 
 * Features:
 * - Simple file selection via button click
 * - Upload progress tracking
 * - File type and size validation
 * - Uploads to local server storage
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 100MB)
 * @param props.allowedFileTypes - Array of allowed MIME types
 * @param props.onComplete - Callback function called when upload is complete
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedFileTypes,
  onComplete,
  buttonClassName,
  children,
  "data-testid": dataTestId,
}: ObjectUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > maxNumberOfFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload ${maxNumberOfFiles} file(s) at a time`,
        variant: "destructive",
      });
      return;
    }

    const file = files[0];

    // Validate file size
    if (file.size > maxFileSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (allowedFileTypes && allowedFileTypes.length > 0) {
      const fileType = file.type;
      const isAllowed = allowedFileTypes.some(type => {
        if (type.endsWith('/*')) {
          const prefix = type.slice(0, -2);
          return fileType.startsWith(prefix);
        }
        return fileType === type;
      });

      if (!isAllowed) {
        toast({
          title: "Invalid file type",
          description: `Only ${allowedFileTypes.join(', ')} files are allowed`,
          variant: "destructive",
        });
        return;
      }
    }

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      toast({
        title: "Upload successful",
        description: `File ${file.name} uploaded successfully`,
      });

      if (onComplete) {
        onComplete({
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileType: data.fileType,
        });
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept={allowedFileTypes?.join(',')}
        multiple={maxNumberOfFiles > 1}
      />
      <Button 
        onClick={() => fileInputRef.current?.click()} 
        className={buttonClassName}
        data-testid={dataTestId}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : children}
      </Button>
    </div>
  );
}
