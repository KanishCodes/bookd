import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Drawer = ({ isOpen, onClose, title, subtitle, children, width = 'max-w-lg' }) => {
  // Close on Escape key
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-[2px] transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex pl-10">
        <div className={`w-screen ${width} bg-merino-light border-l border-sand shadow-drawer flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out`}>
          {/* Header */}
          <div className="p-6 border-b border-sand bg-merino/50 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-ink-muted mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-ink-muted hover:text-ink hover:bg-sand/40 transition"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
