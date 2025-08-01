import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { lookupPostcode } from '../lib/postcodeLookup';

/**
 * Filters available when searching for properties.  All fields are optional.
 */
export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  listingType?: string; // 'rent' or 'sale'
  hasPhoto?: boolean;
  keywords?: string;
  addedSince?: number; // number of days ago
  minFloorArea?: number;
  maxFloorArea?: number;
  minAge?: number;
  maxAge?: number;
  energyRating?: string;
  tenure?: string;
  postcode?: string;
  radiusMiles?: number;
}

/**
 * Custom hook for retrieving properties from Supabase.  It accepts a filter
 * object and returns a React Query result containing the matched rows.  The
 * query key includes the filter so that caching behaves correctly per filter
 * combination.
 */
export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select(
          `*, property_media!property_id(url, type, ord)`,
        )
        .order('created_at', { ascending: false });
      query = query.eq('status', 'available');

      if (filters.postcode && filters.radiusMiles) {
        const coords = await lookupPostcode(filters.postcode);
        if (coords) {
          const { latitude, longitude } = coords;
          const latDelta = filters.radiusMiles / 69;
          const lonDelta =
            filters.radiusMiles / (69 * Math.cos((latitude * Math.PI) / 180));
          query = query
            .gte('latitude', latitude - latDelta)
            .lte('latitude', latitude + latDelta)
            .gte('longitude', longitude - lonDelta)
            .lte('longitude', longitude + lonDelta);
        }
      }

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }
      if (filters.minPrice != null) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters.maxPrice != null) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters.bedrooms != null) {
        query = query.gte('bedrooms', filters.bedrooms);
      }
      if (filters.bathrooms != null) {
        query = query.gte('bathrooms', filters.bathrooms);
      }
      if (filters.minFloorArea != null) {
        query = query.gte('floor_area', filters.minFloorArea);
      }
      if (filters.maxFloorArea != null) {
        query = query.lte('floor_area', filters.maxFloorArea);
      }
      if (filters.minAge != null) {
        query = query.gte('property_age', filters.minAge);
      }
      if (filters.maxAge != null) {
        query = query.lte('property_age', filters.maxAge);
      }
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType);
      }
      if (filters.listingType) {
        query = query.eq('listing_type', filters.listingType);
      }
      if (filters.energyRating) {
        query = query.eq('epc_rating', filters.energyRating);
      }
      if (filters.tenure) {
        query = query.eq('tenure', filters.tenure);
      }
      if (filters.hasPhoto) {
        query = query.eq('has_photo', true);
      }
      if (filters.addedSince != null) {
        // Compute date string for filtering by creation date.  We subtract
        // `addedSince` days from now and ask for properties created after that.
        const since = new Date();
        since.setDate(since.getDate() - filters.addedSince);
        query = query.gte('created_at', since.toISOString());
      }
      // Keyword search across title and description using ilike.
      if (filters.keywords) {
        const kw = filters.keywords;
        query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`);
      }
      const { data, error } = await query;
      if (error) {
        throw new Error(error.message);
      }
      // Ensure an array is always returned.
      return data ?? [];
    },
  });
}