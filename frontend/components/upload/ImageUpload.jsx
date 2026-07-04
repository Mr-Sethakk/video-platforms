'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X } from 'lucide-react';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUpload({ onUpload, accept = 'image/*', maxSize = 5242880 }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const validateAndSetFile = useCallback(
    (selectedFile) => {
      setError('');

      // Validate file type
      if (accept !== 'image/*') {
        const acceptedTypes = accept.split(',').map((t) => t.trim());
        const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
        const isAccepted = acceptedTypes.some(
          (type) =>
            type.includes(fileExt) ||
            type.includes(selectedFile.type)
        );
        if (!isAccepted) {
          setError(`不支持的文件类型，仅支持 ${accept}`);
          return;
        }
      }

      // Validate file is image
      if (!selectedFile.type.startsWith('image/')) {
        setError('请上传图片文件');
        return;
      }

      // Validate file size
      if (selectedFile.size > maxSize) {
        setError(`文件大小不能超过 ${formatFileSize(maxSize)}`);
        return;
      }

      setFile(selectedFile);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);

      // Call upload handler
      onUpload(selectedFile);
    },
    [accept, maxSize, onUpload]
  );

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        /* Drop zone */
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-[#6366F1] bg-[rgba(99,102,241,0.05)]'
              : 'border-[#303030] hover:border-[#6366F1]'
          }`}
        >
          <div className="flex flex-col items-center">
            <Upload size={48} strokeWidth={1.5} className="text-[#717171]" />
            <p className="text-sm text-[#AAAAAA] mt-2">点击或拖拽上传图片</p>
            <p className="text-xs text-[#717171] mt-1">
              支持 JPG/PNG，最大 {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      ) : (
        /* Preview */
        <div className="border-2 border-dashed border-[#303030] rounded-xl p-4">
          <div className="flex gap-4">
            {/* Image preview */}
            <div className="flex-shrink-0">
              {preview && (
                <img
                  src={preview}
                  alt={file.name}
                  className="max-h-48 rounded-lg object-contain"
                />
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p className="text-sm text-white truncate">{file.name}</p>
              <p className="text-xs text-[#717171] mt-1">
                {formatFileSize(file.size)}
              </p>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              className="w-8 h-8 rounded-full bg-[#303030] flex items-center justify-center text-[#AAAAAA] hover:bg-[#EF4444] hover:text-white transition-colors flex-shrink-0 self-start"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-[#EF4444] mt-2">{error}</p>
      )}
    </div>
  );
}
