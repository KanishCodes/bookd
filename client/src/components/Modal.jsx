import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-ink/35 backdrop-blur-[2px] transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className={`relative transform overflow-hidden rounded-md bg-merino-light text-left shadow-elevated transition-all w-full ${maxWidth} border border-sand my-8`}>
          {/* Header */}
          <div className="p-5 border-b border-sand bg-merino/40 flex items-start justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-ink">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-ink-muted mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-ink-muted hover:text-ink hover:bg-sand/40 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
