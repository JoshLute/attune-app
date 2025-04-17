
import React from 'react';
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CurriculumUpload() {
  const { toast } = useToast();

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    // For now just show a toast - in a real app we'd handle the file upload
    toast({
      title: "Files received",
      description: `${files.length} file(s) ready to be uploaded`,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      onDrop={handleFileDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-[hsl(var(--attune-purple))] rounded-xl p-8 text-center cursor-pointer hover:bg-[hsl(var(--attune-purple)/0.05)] transition-colors"
    >
      <div className="flex flex-col items-center gap-3">
        <Upload className="h-10 w-10 text-[hsl(var(--attune-purple))]" />
        <div>
          <p className="font-medium text-[hsl(var(--attune-purple))]">Drop your curriculum or slides here</p>
          <p className="text-sm text-gray-500 mt-1">or click to select files</p>
        </div>
      </div>
    </div>
  );
}
