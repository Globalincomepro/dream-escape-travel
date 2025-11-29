export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ambassador_calendars: {
        Row: {
          access_token: string
          ambassador_id: string
          calendar_id: string
          created_at: string | null
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string | null
        }
        Insert: {
          access_token: string
          ambassador_id: string
          calendar_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          ambassador_id?: string
          calendar_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_calendars_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_content: {
        Row: {
          ambassador_id: string
          caption: string | null
          content_type: string
          created_at: string | null
          file_url: string
          id: string
          is_private: boolean | null
          thumbnail_url: string | null
        }
        Insert: {
          ambassador_id: string
          caption?: string | null
          content_type: string
          created_at?: string | null
          file_url: string
          id?: string
          is_private?: boolean | null
          thumbnail_url?: string | null
        }
        Update: {
          ambassador_id?: string
          caption?: string | null
          content_type?: string
          created_at?: string | null
          file_url?: string
          id?: string
          is_private?: boolean | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_content_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_funnels: {
        Row: {
          created_at: string | null
          custom_bio: string | null
          custom_headline: string | null
          funnel_slug: string
          guest_pass_url: string | null
          hero_image_url: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
          vip_join_url: string | null
          zapier_webhook_url: string | null
        }
        Insert: {
          created_at?: string | null
          custom_bio?: string | null
          custom_headline?: string | null
          funnel_slug: string
          guest_pass_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
          vip_join_url?: string | null
          zapier_webhook_url?: string | null
        }
        Update: {
          created_at?: string | null
          custom_bio?: string | null
          custom_headline?: string | null
          funnel_slug?: string
          guest_pass_url?: string | null
          hero_image_url?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
          vip_join_url?: string | null
          zapier_webhook_url?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          ambassador_id: string
          created_at: string | null
          end_time: string
          google_event_id: string | null
          id: string
          lead_id: string | null
          notes: string | null
          start_time: string
          status: string
        }
        Insert: {
          ambassador_id: string
          created_at?: string | null
          end_time: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          start_time: string
          status?: string
        }
        Update: {
          ambassador_id?: string
          created_at?: string | null
          end_time?: string
          google_event_id?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          caption_template: string | null
          caption_text: string | null
          content_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          caption_template?: string | null
          caption_text?: string | null
          content_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          caption_template?: string | null
          caption_text?: string | null
          content_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: []
      }
      funnel_analytics: {
        Row: {
          ambassador_id: string | null
          created_at: string | null
          event_data: Json | null
          event_type: string
          funnel_id: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          funnel_id?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          funnel_id?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_analytics_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "ambassador_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_gallery_images: {
        Row: {
          caption: string
          created_at: string | null
          funnel_id: string
          id: string
          image_url: string
          location: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          caption: string
          created_at?: string | null
          funnel_id: string
          id?: string
          image_url: string
          location: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          caption?: string
          created_at?: string | null
          funnel_id?: string
          id?: string
          image_url?: string
          location?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_gallery_images_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "ambassador_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_metrics: {
        Row: {
          ambassador_id: string | null
          bookings: number | null
          clicks: number | null
          created_at: string | null
          date: string
          enrollments: number | null
          id: string
          impressions: number | null
          leads: number | null
        }
        Insert: {
          ambassador_id?: string | null
          bookings?: number | null
          clicks?: number | null
          created_at?: string | null
          date: string
          enrollments?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
        }
        Update: {
          ambassador_id?: string | null
          bookings?: number | null
          clicks?: number | null
          created_at?: string | null
          date?: string
          enrollments?: number | null
          id?: string
          impressions?: number | null
          leads?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_metrics_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          ambassador_id: string | null
          created_at: string | null
          email: string
          full_name: string | null
          funnel_slug: string | null
          id: string
          intent: string | null
          notes: string | null
          phone: string | null
          preferred_contact_time: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          ambassador_id?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          funnel_slug?: string | null
          id?: string
          intent?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_time?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          ambassador_id?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          funnel_slug?: string | null
          id?: string
          intent?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact_time?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      pending_ambassadors: {
        Row: {
          application_note: string | null
          created_at: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          application_note?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          application_note?: string | null
          created_at?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          region: string | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          region?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          region?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          ambassador_id: string
          analytics_tracked: boolean | null
          content_file_url: string
          content_id: string | null
          content_thumbnail_url: string | null
          created_at: string | null
          custom_caption: string | null
          error_message: string | null
          id: string
          platforms: string[]
          posted_at: string | null
          scheduled_time: string
          status: string
          updated_at: string | null
          zapier_webhook_url: string
        }
        Insert: {
          ambassador_id: string
          analytics_tracked?: boolean | null
          content_file_url: string
          content_id?: string | null
          content_thumbnail_url?: string | null
          created_at?: string | null
          custom_caption?: string | null
          error_message?: string | null
          id?: string
          platforms: string[]
          posted_at?: string | null
          scheduled_time: string
          status?: string
          updated_at?: string | null
          zapier_webhook_url: string
        }
        Update: {
          ambassador_id?: string
          analytics_tracked?: boolean | null
          content_file_url?: string
          content_id?: string | null
          content_thumbnail_url?: string | null
          created_at?: string | null
          custom_caption?: string | null
          error_message?: string | null
          id?: string
          platforms?: string[]
          posted_at?: string | null
          scheduled_time?: string
          status?: string
          updated_at?: string | null
          zapier_webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shares: {
        Row: {
          ambassador_id: string
          channel: string
          clicks: number | null
          content_id: string
          created_at: string | null
          engagements: number | null
          id: string
          referral_link: string
        }
        Insert: {
          ambassador_id: string
          channel: string
          clicks?: number | null
          content_id: string
          created_at?: string | null
          engagements?: number | null
          id?: string
          referral_link: string
        }
        Update: {
          ambassador_id?: string
          channel?: string
          clicks?: number | null
          content_id?: string
          created_at?: string | null
          engagements?: number | null
          id?: string
          referral_link?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_library"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_analytics: {
        Row: {
          ambassador_id: string
          clicks: number | null
          conversions: number | null
          created_at: string | null
          id: string
          platform: string
          scheduled_post_id: string | null
        }
        Insert: {
          ambassador_id: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          platform: string
          scheduled_post_id?: string | null
        }
        Update: {
          ambassador_id?: string
          clicks?: number | null
          conversions?: number | null
          created_at?: string | null
          id?: string
          platform?: string
          scheduled_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_post_analytics_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_post_analytics_scheduled_post_id_fkey"
            columns: ["scheduled_post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_ambassador: {
        Args: { _admin_id: string; _user_id: string }
        Returns: undefined
      }
      bulk_approve_ambassadors: {
        Args: { _admin_id: string; _user_ids: string[] }
        Returns: Json
      }
      check_slug_availability: {
        Args: { _exclude_user_id?: string; _slug: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_to_ambassador: { Args: { _user_id: string }; Returns: Json }
    }
    Enums: {
      app_role: "prospect" | "guest" | "vip" | "ambassador" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["prospect", "guest", "vip", "ambassador", "admin"],
    },
  },
} as const
