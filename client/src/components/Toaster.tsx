'use client';

import { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToasterProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export function Toaster({ toasts, onRemoveToast }: ToasterProps) {
  useEffect(() => {
    toasts.forEach((toast) => {
      const duration = toast.duration || 3000;
      const timer = setTimeout(() => {
        onRemoveToast(toast.id);
      }, duration);

      return () => clearTimeout(timer);
    });
  }, [toasts, onRemoveToast]);

  const getToastStyles = (type: ToastMessage['type']) => {
    const baseStyles = {
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      fontFamily: 'var(--ep-font-avenir)',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '300px',
      maxWidth: '500px',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          background: '#DDF4E6',
          color: '#0D5A2B',
          border: '1px solid #65CC8E',
        };
      case 'error':
        return {
          ...baseStyles,
          background: '#FFEAEA',
          color: '#C53030',
          border: '1px solid #F56565',
        };
      case 'warning':
        return {
          ...baseStyles,
          background: '#FFF3CD',
          color: '#B7791F',
          border: '1px solid #F6E05E',
        };
      case 'info':
        return {
          ...baseStyles,
          background: '#E4EFFF',
          color: '#113D7B',
          border: '1px solid #3182CE',
        };
      default:
        return baseStyles;
    }
  };

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={getToastStyles(toast.type)}
          onClick={() => onRemoveToast(toast.id)}
        >
          <span style={{ fontSize: '16px' }}>{getIcon(toast.type)}</span>
          <span>{toast.message}</span>
          <span style={{ marginLeft: 'auto', opacity: 0.7 }}>×</span>
        </div>
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, duration?: number) => addToast(message, 'success', duration);
  const showError = (message: string, duration?: number) => addToast(message, 'error', duration);
  const showWarning = (message: string, duration?: number) => addToast(message, 'warning', duration);
  const showInfo = (message: string, duration?: number) => addToast(message, 'info', duration);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
