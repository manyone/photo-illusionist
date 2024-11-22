import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  className?: string;
}

export const ImageUploader = ({ onImageSelect, className }: ImageUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onImageSelect(acceptedFiles[0]);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 transition-all duration-200 ease-in-out cursor-pointer",
        isDragActive ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className="w-8 h-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {isDragActive ? (
            "Drop your image here..."
          ) : (
            "Drag & drop an image here, or click to select"
          )}
        </p>
      </div>
    </div>
  );
};