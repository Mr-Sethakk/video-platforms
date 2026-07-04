'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  maxWidth = 'max-w-lg',
}) {
  const contentRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  // Focus trap and restore focus
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement;
      // Focus the modal content on open
      setTimeout(() => {
        contentRef.current?.focus();
      }, 50);
    } else {
      // Restore focus on close
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Content */}
      <div
        ref={contentRef}
        tabIndex={-1}
        className={`
          relative bg-[#212121] rounded-2xl border border-[rgba(255,255,255,0.08)]
          shadow-2xl p-6 w-full mx-4
          animate-scale-in
          ${maxWidth}
        `}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#AAAAAA] hover:text-white transition-colors p-1 -mr-1"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Close button when no title (floating top-right) */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#AAAAAA] hover:text-white transition-colors p-1"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        )}

        {/* Body */}
        {children}
      </div>
    </div>
  );
}
