import { useEffect, useState, useMemo } from 'react';
import { fetchUpcomingEvents } from '../api/events.api';

/**
 * Custom hook to manage the state of upcoming event cards and active lightbox selections.
 */
export function useEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const data = await fetchUpcomingEvents(10);
        setEvents(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const expandedEvent = useMemo(
    () => events.find(e => e.id === expandedId) ?? null,
    [events, expandedId]
  );

  return {
    events,
    expandedId,
    setExpandedId,
    expandedEvent,
    loading,
    error,
  };
}
