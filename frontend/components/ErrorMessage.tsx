'use client';

import { AlertCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  dismissible?: boolean;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
  title?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function ErrorMessage({
  message,
  type = 'error',
  dismissible = false,
  onDismiss,
  onRetry,
  className = '',
  title,
  action,
}: ErrorMessageProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const styles = {
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      button: 'text-red-600 hover:text-red-800',
    },
    warning: {
      container: 'bg-orange-50 border-orange-200 text-orange-900',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      button: 'text-orange-600 hover:text-orange-800',
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      button: 'text-blue-600 hover:text-blue-800',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <AlertCircle className="w-5 h-5 text-green-600" />,
      button: 'text-green-600 hover:text-green-800',
    },
  };

  const style = styles[type];

  return (
    <div className={`border rounded-lg p-4 ${style.container} ${className}`} role="alert">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-semibold mb-1">{title}</h3>
          )}
          <p className="text-sm whitespace-pre-wrap">{message}</p>
          
          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium underline ${style.button} transition-colors`}
            >
              {action.label}
            </button>
          )}
          
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 text-sm font-medium underline ${style.button} transition-colors`}
            >
              Try Again
            </button>
          )}
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${style.button} transition-colors`}
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ErrorCard({ 
  message, 
  title = 'Error',
  onRetry,
}: { 
  message: string; 
  title?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-8">
      <div className="flex flex-col items-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h3>
        <p className="text-sm text-neutral-600 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-600 text-sm">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {message}
    </p>
  );
}
