import { supabase } from '@/lib/supabaseClient';

/**
 * Data Access Layer for Library Events.
 */
export async function fetchUpcomingEvents(limit = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
    .gte('event_date', new Date().toISOString())
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}
