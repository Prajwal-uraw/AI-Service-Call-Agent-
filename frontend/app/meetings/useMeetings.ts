import { useQuery } from '@tanstack/react-query';

async function fetchMeetings() {
  const res = await fetch('/api/meetings');
  if (!res.ok) throw new Error('Failed to fetch meetings');
  return res.json();
}

export function useMeetings() {
  return useQuery({
    queryKey: ['meetings'],
    queryFn: fetchMeetings,
  });
}
