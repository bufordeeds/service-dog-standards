"use client"

import * as React from "react"
import { X, Camera, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export interface ImageUploadProps {
  value?: string
  onChange?: (value: string) => void
  onRemove?: () => void
  disabled?: boolean
  className?: string
  variant?: "profile" | "banner" | "document"
  maxSize?: number // in MB
  acceptedTypes?: string[]
  placeholder?: string
}

function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
  className,
  variant = "profile",
  maxSize = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp"],
  placeholder,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = React.useCallback(
    (file: File) => {
      if (disabled) return

      setError(null)
      setIsUploading(true)

      try {
        // Validate file type
        if (!acceptedTypes.includes(file.type)) {
          throw new Error(`File type not supported. Please upload: ${acceptedTypes.join(", ")}`)
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File too large. Maximum size is ${maxSize}MB`)
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        onChange?.(previewUrl)

        // TODO: Implement actual file upload to storage service
        // For now, just use the preview URL
        console.log("File selected:", file.name, file.size, file.type)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed")
      } finally {
        setIsUploading(false)
      }
    },
    [acceptedTypes, maxSize, onChange, disabled]
  )

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0 && files[0]) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0 && files[0]) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect]
  )

  const handleRemove = React.useCallback(() => {
    if (value) {
      URL.revokeObjectURL(value)
    }
    onRemove?.()
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [value, onRemove])

  const getAspectRatio = () => {
    switch (variant) {
      case "banner":
        return "aspect-[3/1]"
      case "profile":
        return "aspect-square"
      case "document":
        return "aspect-[4/3]"
      default:
        return "aspect-square"
    }
  }

  const getSize = () => {
    switch (variant) {
      case "banner":
        return "w-full max-w-2xl"
      case "profile":
        return "w-32 h-32"
      case "document":
        return "w-full max-w-md"
      default:
        return "w-32 h-32"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-colors",
          getSize(),
          variant !== "profile" && getAspectRatio(),
          isDragging && "border-primary bg-primary/5",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer hover:border-primary/50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {/* Display uploaded image */}
        {value && !isUploading && (
          <>
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Remove button */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove image</span>
            </Button>
          </>
        )}

        {/* Upload placeholder */}
        {!value && !isUploading && (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            {variant === "profile" ? (
              <Camera className="h-8 w-8 text-muted-foreground mb-2" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {acceptedTypes.map(type => type.split("/")[1]).join(", ")} up to {maxSize}MB
            </div>
            {placeholder && (
              <div className="text-xs text-muted-foreground mt-1">
                {placeholder}
              </div>
            )}
          </div>
        )}

        {/* Loading state */}
        {isUploading && (
          <div className="flex flex-col items-center justify-center h-full">
            <LoadingSpinner size="lg" label="Uploading..." />
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  )
}

export { ImageUpload }