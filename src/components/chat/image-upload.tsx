"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

type ImageUploadProps = {
  onImageSelect: (file: File) => void;
  selectedImage: File | null;
  onRemove: () => void;
  disabled?: boolean;
};

export function ImageUpload({ onImageSelect, selectedImage, onRemove, disabled }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  const validateAndSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("ファイルサイズが大きすぎます（最大5MB）");
        return;
      }
      onImageSelect(file);
    },
    [onImageSelect]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {selectedImage && previewUrl ? (
        <div className="relative group">
          <img
            src={previewUrl}
            alt="添付画像プレビュー"
            className="h-16 w-16 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            title="画像を削除"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="画像をアップロード"
          className="shrink-0"
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/**
 * Hook to handle paste and drag-and-drop image events on a container element.
 */
export function useImageDrop(onImageSelect: (file: File) => void) {
  const [isDragging, setIsDragging] = useState(false);

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const files = e.clipboardData?.files;
      if (!files?.length) return;
      const imageFile = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (imageFile) {
        e.preventDefault();
        if (imageFile.size > MAX_FILE_SIZE) {
          toast.error("ファイルサイズが大きすぎます（最大5MB）");
          return;
        }
        onImageSelect(imageFile);
      }
    },
    [onImageSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error("ファイルサイズが大きすぎます（最大5MB）");
          return;
        }
        onImageSelect(file);
      }
    },
    [onImageSelect]
  );

  return {
    isDragging,
    handlePaste,
    dragProps: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
