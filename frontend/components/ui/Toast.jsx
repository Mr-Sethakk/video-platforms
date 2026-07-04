'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = ++toastIdCounter;
      setToasts((prev) => [...prev, { id, type, message, exiting: false }]);

      // Auto-dismiss after 3 seconds
      timersRef.current[id] = setTimeout(() => {
        // Start exit animation
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
        );
        // Remove after transition
        setTimeout(() => removeToast(id), 300);
      }, 3000);

      return id;
    },
    [removeToast]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const typeStyles = {
    success: 'bg-[#10B981]/20 border border-[#10B981]/30',
    error: 'bg-[#EF4444]/20 border border-[#EF4444]/30',
    info: 'bg-[#6366F1]/20 border border-[#6366F1]/30',
  };

  const typeIconColors = {
    success: 'text-[#10B981]',
    error: 'text-[#EF4444]',
    info: 'text-[#6366F1]',
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              rounded-xl p-4 shadow-2xl max-w-sm pointer-events-auto
              animate-slide-up
              ${typeStyles[toast.type] || typeStyles.info}
              ${toast.exiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
              transition-all duration-300 ease-out
            `}
          >
            <div className="flex items-start gap-3">
              {/* Dot indicator */}
              <span
                className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${typeIconColors[toast.type] || typeIconColors.info}`}
              />
              {/* Message */}
              <p className="text-white text-sm flex-1 leading-relaxed">
                {toast.message}
              </p>
              {/* Close button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#AAAAAA] hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
