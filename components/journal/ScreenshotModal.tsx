'use client';

import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import Image from 'next/image';

interface ScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  currentImageUrl?: string;
  title: string;
}

export function ScreenshotModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  currentImageUrl,
  title,
}: ScreenshotModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('لطفا فقط فایل تصویری انتخاب کنید');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم فایل نباید بیشتر از 5 مگابایت باشد');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }
          break;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onSave(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      alert('خطا در آپلود تصویر');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !currentImageUrl) return;

    if (!confirm('آیا از حذف این تصویر اطمینان دارید؟')) return;

    setIsDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      alert('خطا در حذف تصویر');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Use proxy URL for authenticated access
  const displayUrl = previewUrl || (currentImageUrl ? `/api/journal/screenshots/download?path=${encodeURIComponent(currentImageUrl)}` : null);
  const hasImage = !!displayUrl;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        {hasImage ? (
          /* Image Preview */
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <div className="relative h-96 flex items-center justify-center">
              <Image
                src={displayUrl}
                alt="Screenshot"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        ) : (
          /* Upload Area */
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handlePaste}
            tabIndex={0}
          >
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-white mb-2">کلیک کنید یا فایل را بکشید</p>
            <p className="text-sm text-gray-400 mb-2">
              یا Ctrl+V برای Paste از کلیپبورد
            </p>
            <p className="text-xs text-gray-500">
              حداکثر حجم: 5MB | فرمت‌های مجاز: JPG, PNG, WebP
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div>
            {currentImageUrl && !previewUrl && onDelete && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                حذف تصویر
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              {hasImage ? 'بستن' : 'انصراف'}
            </Button>
            {selectedFile && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  انتخاب مجدد
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isUploading}
                >
                  آپلود تصویر
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
