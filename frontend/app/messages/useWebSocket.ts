import { useEffect } from 'react';

export function useWebSocket({ onMessage }: { onMessage: (message: any) => void }) {
  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3001/ws'); // Adjust to your backend WS URL
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'newMessage') {
          onMessage(data.message);
        }
      } catch {}
    };
    return () => {
      socket.close();
    };
  }, [onMessage]);
}
