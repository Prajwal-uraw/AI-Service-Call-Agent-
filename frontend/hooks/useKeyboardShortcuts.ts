import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Open search/command palette
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
      description: 'Quick search'
    },
    {
      key: 'd',
      ctrlKey: true,
      action: () => router.push('/dashboard'),
      description: 'Go to Dashboard'
    },
    {
      key: 'n',
      ctrlKey: true,
      action: () => router.push('/admin/outbound-calls'),
      description: 'New outbound call'
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => router.push('/calls'),
      description: 'Call history'
    },
    {
      key: 'i',
      ctrlKey: true,
      action: () => router.push('/admin/call-intelligence'),
      description: 'Call intelligence'
    },
    {
      key: 'c',
      ctrlKey: true,
      action: () => router.push('/contacts'),
      description: 'Contacts'
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        // Show keyboard shortcuts help
        alert(`Keyboard Shortcuts:
        
Ctrl+K - Quick search
Ctrl+D - Dashboard
Ctrl+N - New outbound call
Ctrl+H - Call history
Ctrl+I - Call intelligence
Ctrl+C - Contacts
Ctrl+/ - Show this help`);
      },
      description: 'Show keyboard shortcuts'
    }
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const shortcut = shortcuts.find(
        (s) =>
          s.key.toLowerCase() === event.key.toLowerCase() &&
          (s.ctrlKey === undefined || s.ctrlKey === event.ctrlKey) &&
          (s.shiftKey === undefined || s.shiftKey === event.shiftKey) &&
          (s.altKey === undefined || s.altKey === event.altKey)
      );

      if (shortcut) {
        // Don't trigger shortcuts when typing in input fields
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          // Exception: Allow Ctrl+K even in input fields for quick search
          if (!(shortcut.key === 'k' && shortcut.ctrlKey)) {
            return;
          }
        }

        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);

  return shortcuts;
}
