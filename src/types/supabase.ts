/**
 * Type definitions for our Supabase database.  These types mirror the table
 * definitions declared in `supabase/seed.sql` and allow us to interact with
 * Supabase in a type‑safe way.  See https://supabase.com/docs/guides/typescript
 * for details on how these generics are consumed by the Supabase client.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: string;
          avatar_url: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          role?: string;
          avatar_url?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      properties: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          price: number;
          bedrooms: number;
          bathrooms: number;
          property_type: string;
          listing_type: string;
          latitude: number | null;
          longitude: number | null;
          address: string | null;
          city: string | null;
          postcode: string | null;
          floor_area: number | null;
          epc_rating: string | null;
          property_age: number | null;
          tenure: string | null;
          amenities: string[] | null;
          has_photo: boolean;
          agent_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          price: number;
          bedrooms?: number;
          bathrooms?: number;
          property_type: string;
          listing_type: string;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          city?: string | null;
          postcode?: string | null;
          floor_area?: number | null;
          epc_rating?: string | null;
          property_age?: number | null;
          tenure?: string | null;
          amenities?: string[] | null;
          has_photo?: boolean;
          agent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          bedrooms?: number;
          bathrooms?: number;
          property_type?: string;
          listing_type?: string;
          latitude?: number | null;
          longitude?: number | null;
          address?: string | null;
          city?: string | null;
          postcode?: string | null;
          floor_area?: number | null;
          epc_rating?: string | null;
          property_age?: number | null;
          tenure?: string | null;
          amenities?: string[] | null;
          has_photo?: boolean;
          agent_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'properties_agent_id_fkey';
            columns: ['agent_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      property_media: {
        Row: {
          id: string;
          property_id: string | null;
          url: string;
          type: string;
          ord: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          type?: string;
          ord?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          url?: string;
          type?: string;
          ord?: number | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'property_media_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      price_history: {
        Row: {
          id: string;
          property_id: string | null;
          price: number;
          recorded_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          price: number;
          recorded_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          price?: number;
          recorded_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'price_history_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
      favorites: {
        Row: {
          user_id: string;
          property_id: string;
          created_at: string | null;
        };
        Insert: {
          user_id: string;
          property_id: string;
          created_at?: string | null;
        };
        Update: {
          user_id?: string;
          property_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          property_id: string | null;
          sender_id: string | null;
          receiver_id: string | null;
          content: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_receiver_id_fkey';
            columns: ['receiver_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          criteria: Json;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          criteria: Json;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          criteria?: Json;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_searches_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          property_id: string | null;
          user_id: string | null;
          rating: number;
          comment: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          property_id: string;
          user_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          property_id?: string;
          user_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
