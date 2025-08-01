import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTrackPropertyView(propertyId: string | null) {
  useEffect(() => {
    if (propertyId) {
      supabase.rpc('increment_property_view', { p_id: propertyId });
    }
  }, [propertyId]);
}
