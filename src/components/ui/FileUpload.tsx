'use client';

import React, { useState, useRef } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxSizeMB?: number;
}

export function FileUpload({ onFilesSelected, maxSizeMB = 25 }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    
    if (fileArray.length === 0) return;

    const invalidFile = fileArray.find(f => f.size > maxSizeMB * 1024 * 1024);
    if (invalidFile) {
      setError(`"${invalidFile.name}" is too large. Max file size is ${maxSizeMB} MB.`);
      return;
    }

    onFilesSelected(fileArray);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="upload-error flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4m0 4h.01" />
          </svg>
          <div><b>Error:</b> {error}</div>
        </div>
      )}
      <label 
        className={`dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          multiple 
          style={{ display: 'none' }} 
          ref={fileInputRef}
          onChange={onChange}
        />
        <span className="dz-ico">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 16V5m0 0l-4 4m4-4l4 4" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 19h14" stroke="#5a9e2f" strokeWidth="1.9" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="dz-text">
          <b>Upload a document</b>
          <span className="dz-sub">Click to browse or drag a file here &middot; up to {maxSizeMB} MB</span>
        </span>
      </label>
    </div>
  );
}
