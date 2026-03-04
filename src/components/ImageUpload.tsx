"use client";

// ═══════════════════════════════════════════════════════
// DreamWeave AI — Image Upload Component
// ═══════════════════════════════════════════════════════

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { fileToBase64 } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export default function ImageUpload({ onImageSelect, onClear, disabled }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be under 5MB");
        return;
      }

      const base64 = await fileToBase64(file);
      setPreview(base64);
      onImageSelect(base64);
    },
    [onImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled,
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onClear();
  };

  if (preview) {
    return (
      <div className="relative group">
        <img
          src={preview}
          alt="Dream sketch"
          className="w-full h-32 object-cover rounded-xl border border-dream-border"
        />
        <button
          onClick={handleClear}
          className="absolute top-2 right-2 p-1 rounded-full bg-dream-bg/80 text-dream-muted hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="absolute bottom-2 left-2 text-xs text-dream-muted bg-dream-bg/80 px-2 py-1 rounded-md">
          Dream sketch uploaded
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-dream-accent bg-dream-accent/10"
          : "border-dream-border hover:border-dream-accent/50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <ImagePlus className="w-6 h-6 text-dream-muted mx-auto mb-1" />
      <p className="text-xs text-dream-muted">
        {isDragActive ? "Drop your dream sketch..." : "Upload sketch or photo"}
      </p>
    </div>
  );
}
