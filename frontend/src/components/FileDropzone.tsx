'use client';

import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Film, File, X, AlertCircle } from 'lucide-react';

interface FileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
];

export default function FileDropzone({
  files,
  onFilesChange,
  maxSizeMB = 25,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (file.type === 'application/pdf' || file.type.includes('document') || file.type.includes('sheet') || file.type.includes('text')) {
      return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-muted-foreground shrink-0" />;
  };

  const validateAndAddFiles = useCallback(
    (newFiles: FileList | File[]) => {
      setValidationError(null);
      const validFiles: File[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      Array.from(newFiles).forEach((file) => {
        // Disallow videos explicitly
        if (file.type.startsWith('video/') || /\.(mp4|mov|mpeg|avi|mkv|webm|wmv|flv)$/i.test(file.name)) {
          setValidationError(`Video file "${file.name}" is not allowed. Only documents and images are permitted.`);
          return;
        }

        // Check file size
        if (file.size > maxSizeBytes) {
          setValidationError(`"${file.name}" exceeds the maximum limit of ${maxSizeMB}MB.`);
          return;
        }

        // Check MIME type & extension
        const isAllowedType =
          ALLOWED_MIME_TYPES.includes(file.type) ||
          /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt|csv)$/i.test(file.name);

        if (!isAllowedType) {
          setValidationError(`File type of "${file.name}" is not supported. Only documents and images are allowed.`);
          return;
        }

        // Avoid exact duplicates
        const alreadyExists = files.some(
          (f) => f.name === file.name && f.size === file.size && f.lastModified === file.lastModified
        );
        if (!alreadyExists) {
          validFiles.push(file);
        }
      });

      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
    },
    [files, maxSizeMB, onFilesChange]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndAddFiles(e.target.files);
      // Reset input value so same file can be selected again if removed
      e.target.value = '';
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    const updated = files.filter((_, idx) => idx !== indexToRemove);
    onFilesChange(updated);
    setValidationError(null);
  };

  return (
    <div className="space-y-3">
      {/* Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-5 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer text-center ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-border/50 bg-muted/10'
            : isDragging
            ? 'border-primary bg-primary/10 scale-[0.99] shadow-inner'
            : 'border-border/70 hover:border-primary/50 hover:bg-muted/30 bg-muted/15'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          disabled={disabled}
          onChange={handleFileInputChange}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />

        <div
          className={`p-2.5 rounded-full mb-2 transition-transform duration-200 ${
            isDragging ? 'bg-primary/20 text-primary scale-110' : 'bg-muted text-muted-foreground'
          }`}
        >
          <UploadCloud className="w-5 h-5" />
        </div>

        <p className="text-xs font-medium text-foreground">
          <span className="text-primary font-semibold hover:underline">Click to upload</span> or drag and drop files
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          Supports Images & Documents (PDF, Word, Excel, TXT, CSV) up to {maxSizeMB}MB. Videos are not allowed.
        </p>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 p-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Attached Files ({files.length})
          </p>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/40 border border-border/60 hover:border-border transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {getFileIcon(file)}
                  <span className="font-medium text-foreground truncate max-w-[240px] sm:max-w-[320px]">
                    {file.name}
                  </span>
                  <span className="text-muted-foreground text-[11px] shrink-0">
                    ({formatFileSize(file.size)})
                  </span>
                </div>

                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
