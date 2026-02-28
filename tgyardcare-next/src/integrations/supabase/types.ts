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
      blog_posts: {
        Row: {
          author: string
          content: string
          created_at: string
          excerpt: string
          id: string
          image_url: string | null
          meta_description: string | null
          published_at: string
          seo_keywords: string[] | null
          slug: string
          title: string
        }
        Insert: {
          author?: string
          content: string
          created_at?: string
          excerpt: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          published_at?: string
          seo_keywords?: string[] | null
          slug: string
          title: string
        }
        Update: {
          author?: string
          content?: string
          created_at?: string
          excerpt?: string
          id?: string
          image_url?: string | null
          meta_description?: string | null
          published_at?: string
          seo_keywords?: string[] | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          id: string
          messages: Json
          service_interest: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          messages?: Json
          service_interest?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          id?: string
          messages?: Json
          service_interest?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_session_secrets: {
        Row: {
          created_at: string
          last_seen_at: string
          secret_hash: string
          session_id: string
        }
        Insert: {
          created_at?: string
          last_seen_at?: string
          secret_hash: string
          session_id: string
        }
        Update: {
          created_at?: string
          last_seen_at?: string
          secret_hash?: string
          session_id?: string
        }
        Relationships: []
      }
      chatbot_feedback: {
        Row: {
          created_at: string
          feedback_text: string | null
          id: string
          rating: number
          session_id: string
        }
        Insert: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating: number
          session_id: string
        }
        Update: {
          created_at?: string
          feedback_text?: string | null
          id?: string
          rating?: number
          session_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          category: string
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          service: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          service: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          service?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_follow_ups: {
        Row: {
          contact_submission_id: string
          created_at: string
          email_sent_to: string
          follow_up_sent_at: string
          follow_up_type: string
          id: string
          service_recommendations: string[] | null
        }
        Insert: {
          contact_submission_id: string
          created_at?: string
          email_sent_to: string
          follow_up_sent_at?: string
          follow_up_type: string
          id?: string
          service_recommendations?: string[] | null
        }
        Update: {
          contact_submission_id?: string
          created_at?: string
          email_sent_to?: string
          follow_up_sent_at?: string
          follow_up_type?: string
          id?: string
          service_recommendations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_follow_ups_contact_submission_id_fkey"
            columns: ["contact_submission_id"]
            isOneToOne: false
            referencedRelation: "contact_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      page_seo: {
        Row: {
          canonical_url: string | null
          change_frequency: string | null
          created_at: string
          id: string
          is_indexable: boolean
          last_modified_by: string | null
          meta_description: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          page_name: string
          page_path: string
          page_type: string
          primary_keyword: string | null
          priority: number | null
          schema_data: Json | null
          schema_type: string | null
          secondary_keywords: string[] | null
          seo_title: string | null
          twitter_card: string | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          change_frequency?: string | null
          created_at?: string
          id?: string
          is_indexable?: boolean
          last_modified_by?: string | null
          meta_description?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_name: string
          page_path: string
          page_type?: string
          primary_keyword?: string | null
          priority?: number | null
          schema_data?: Json | null
          schema_type?: string | null
          secondary_keywords?: string[] | null
          seo_title?: string | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          change_frequency?: string | null
          created_at?: string
          id?: string
          is_indexable?: boolean
          last_modified_by?: string | null
          meta_description?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          page_name?: string
          page_path?: string
          page_type?: string
          primary_keyword?: string | null
          priority?: number | null
          schema_data?: Json | null
          schema_type?: string | null
          secondary_keywords?: string[] | null
          seo_title?: string | null
          twitter_card?: string | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      performance_audits: {
        Row: {
          accessibility_score: number | null
          audit_data: Json | null
          best_practices_score: number | null
          cls_score: number | null
          created_at: string
          fid_score: number | null
          id: string
          lcp_score: number | null
          page_url: string
          performance_score: number | null
          seo_score: number | null
          speed_index: number | null
          time_to_interactive: number | null
          total_blocking_time: number | null
        }
        Insert: {
          accessibility_score?: number | null
          audit_data?: Json | null
          best_practices_score?: number | null
          cls_score?: number | null
          created_at?: string
          fid_score?: number | null
          id?: string
          lcp_score?: number | null
          page_url: string
          performance_score?: number | null
          seo_score?: number | null
          speed_index?: number | null
          time_to_interactive?: number | null
          total_blocking_time?: number | null
        }
        Update: {
          accessibility_score?: number | null
          audit_data?: Json | null
          best_practices_score?: number | null
          cls_score?: number | null
          created_at?: string
          fid_score?: number | null
          id?: string
          lcp_score?: number | null
          page_url?: string
          performance_score?: number | null
          seo_score?: number | null
          speed_index?: number | null
          time_to_interactive?: number | null
          total_blocking_time?: number | null
        }
        Relationships: []
      }
      promo_settings: {
        Row: {
          created_at: string
          discount: string
          display_order: number
          duration_hours: number
          id: string
          is_active: boolean
          path: string
          seasons: string[]
          service: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount: string
          display_order?: number
          duration_hours?: number
          id?: string
          is_active?: boolean
          path: string
          seasons?: string[]
          service: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount?: string
          display_order?: number
          duration_hours?: number
          id?: string
          is_active?: boolean
          path?: string
          seasons?: string[]
          service?: string
          updated_at?: string
        }
        Relationships: []
      }
      season_override: {
        Row: {
          active_override: string | null
          id: string
          preview_mode: boolean | null
          preview_season: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active_override?: string | null
          id?: string
          preview_mode?: boolean | null
          preview_season?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active_override?: string | null
          id?: string
          preview_mode?: boolean | null
          preview_season?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      season_settings: {
        Row: {
          created_at: string
          end_day: number
          end_month: number
          id: string
          season: string
          start_day: number
          start_month: number
          theme_colors: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_day: number
          end_month: number
          id?: string
          season: string
          start_day: number
          start_month: number
          theme_colors?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_day?: number
          end_month?: number
          id?: string
          season?: string
          start_day?: number
          start_month?: number
          theme_colors?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      seasonal_priority_services: {
        Row: {
          badge_text: string | null
          bundle_discount: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_bundle: boolean | null
          limited_slots: boolean | null
          season: string
          service_description: string | null
          service_name: string
          service_order: number
          service_path: string
          slots_remaining: number | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          bundle_discount?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_bundle?: boolean | null
          limited_slots?: boolean | null
          season: string
          service_description?: string | null
          service_name: string
          service_order?: number
          service_path: string
          slots_remaining?: number | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          bundle_discount?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_bundle?: boolean | null
          limited_slots?: boolean | null
          season?: string
          service_description?: string | null
          service_name?: string
          service_order?: number
          service_path?: string
          slots_remaining?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      seasonal_slides: {
        Row: {
          background_image_url: string | null
          bullets: string[]
          created_at: string
          headline: string
          id: string
          is_active: boolean | null
          primary_cta_link: string
          primary_cta_text: string
          season: string
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          slide_order: number
          trust_chips: string[] | null
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          bullets?: string[]
          created_at?: string
          headline: string
          id?: string
          is_active?: boolean | null
          primary_cta_link?: string
          primary_cta_text?: string
          season: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          slide_order?: number
          trust_chips?: string[] | null
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          bullets?: string[]
          created_at?: string
          headline?: string
          id?: string
          is_active?: boolean | null
          primary_cta_link?: string
          primary_cta_text?: string
          season?: string
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          slide_order?: number
          trust_chips?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      upsell_clicks: {
        Row: {
          clicked_at: string
          id: string
          referrer_page: string | null
          service_name: string
          service_path: string
          session_id: string | null
        }
        Insert: {
          clicked_at?: string
          id?: string
          referrer_page?: string | null
          service_name: string
          service_path: string
          session_id?: string | null
        }
        Update: {
          clicked_at?: string
          id?: string
          referrer_page?: string | null
          service_name?: string
          service_path?: string
          session_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_chat_session: {
        Args: { request_session_id: string; row_session_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
