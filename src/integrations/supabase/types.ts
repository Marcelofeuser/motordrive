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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_deletion_requests: {
        Row: {
          id: string
          user_id: string
          requested_at: string
          reason: string | null
          status: string
        }
        Insert: {
          id?: string
          user_id: string
          requested_at?: string
          reason?: string | null
          status?: string
        }
        Update: {
          id?: string
          user_id?: string
          requested_at?: string
          reason?: string | null
          status?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          bonus: number
          bruto: number
          created_at: string
          date: string
          dinheiro: number
          gorjetas: number
          id: string
          pedagio: number
          platform: string
          taxas: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus?: number
          bruto?: number
          created_at?: string
          date?: string
          dinheiro?: number
          gorjetas?: number
          id?: string
          pedagio?: number
          platform?: string
          taxas?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus?: number
          bruto?: number
          created_at?: string
          date?: string
          dinheiro?: number
          gorjetas?: number
          id?: string
          pedagio?: number
          platform?: string
          taxas?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      electric_alerts: {
        Row: {
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      electric_charging: {
        Row: {
          battery_after: number | null
          battery_before: number | null
          charging_type: string
          cost_per_kwh: number | null
          created_at: string
          date: string
          duration_minutes: number | null
          id: string
          kwh_charged: number
          location: string | null
          notes: string | null
          total_cost: number
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          battery_after?: number | null
          battery_before?: number | null
          charging_type?: string
          cost_per_kwh?: number | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          id?: string
          kwh_charged?: number
          location?: string | null
          notes?: string | null
          total_cost?: number
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          battery_after?: number | null
          battery_before?: number | null
          charging_type?: string
          cost_per_kwh?: number | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          id?: string
          kwh_charged?: number
          location?: string | null
          notes?: string | null
          total_cost?: number
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      electric_usage: {
        Row: {
          battery_consumption: number | null
          battery_final: number
          battery_initial: number
          created_at: string
          date: string
          id: string
          km_final: number
          km_initial: number
          km_total: number | null
          notes: string | null
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          battery_consumption?: number | null
          battery_final?: number
          battery_initial?: number
          created_at?: string
          date?: string
          id?: string
          km_final?: number
          km_initial?: number
          km_total?: number | null
          notes?: string | null
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          battery_consumption?: number | null
          battery_final?: number
          battery_initial?: number
          created_at?: string
          date?: string
          id?: string
          km_final?: number
          km_initial?: number
          km_total?: number | null
          notes?: string | null
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      fueling: {
        Row: {
          created_at: string
          date: string
          fuel_type: string
          id: string
          km: number
          liters: number
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          fuel_type?: string
          id?: string
          km?: number
          liters?: number
          total_cost?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          fuel_type?: string
          id?: string
          km?: number
          liters?: number
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string
          goal_type: string
          id: string
          label: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_type?: string
          id?: string
          label?: string
          target_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_type?: string
          id?: string
          label?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journeys: {
        Row: {
          created_at: string
          date: string
          end_time: string | null
          id: string
          km_final: number
          km_initial: number
          start_time: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          km_final?: number
          km_initial?: number
          start_time?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string | null
          id?: string
          km_final?: number
          km_initial?: number
          start_time?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      earnings_imports: {
        Row: {
          id: string
          user_id: string
          provider: string
          storage_path: string | null
          original_filename: string | null
          mime_type: string | null
          status: string
          extracted_payload: Json | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          storage_path?: string | null
          original_filename?: string | null
          mime_type?: string | null
          status?: string
          extracted_payload?: Json | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          storage_path?: string | null
          original_filename?: string | null
          mime_type?: string | null
          status?: string
          extracted_payload?: Json | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          provider: string
          status: string
          account_label: string | null
          last_synced_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          status?: string
          account_label?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          status?: string
          account_label?: string | null
          last_synced_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      manual_earnings: {
        Row: {
          id: string
          user_id: string
          provider: string
          trip_date: string
          gross_earnings: number
          net_earnings: number
          bonuses: number
          fees: number
          online_hours: number
          source: string
          import_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          trip_date: string
          gross_earnings?: number
          net_earnings?: number
          bonuses?: number
          fees?: number
          online_hours?: number
          source?: string
          import_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          trip_date?: string
          gross_earnings?: number
          net_earnings?: number
          bonuses?: number
          fees?: number
          online_hours?: number
          source?: string
          import_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_imports: {
        Row: {
          id: string
          user_id: string
          provider: string
          trip_date: string
          gross_earnings: number
          net_earnings: number
          bonuses: number
          fees: number
          online_hours: number
          source: string
          source_file: string | null
          raw_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider?: string
          trip_date: string
          gross_earnings?: number
          net_earnings?: number
          bonuses?: number
          fees?: number
          online_hours?: number
          source?: string
          source_file?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          trip_date?: string
          gross_earnings?: number
          net_earnings?: number
          bonuses?: number
          fees?: number
          online_hours?: number
          source?: string
          source_file?: string | null
          raw_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notifications_enabled: boolean
          cnh_alert_enabled: boolean
          fines_alert_enabled: boolean
          discount_alert_enabled: boolean
          ipva_alert_enabled: boolean
          insurance_alert_enabled: boolean
          maintenance_alert_enabled: boolean
          ai_extract_documents: boolean
          ai_financial_copilot: boolean
          default_state: string | null
          default_discount_percent: number | null
          theme: string | null
          language: string | null
          currency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notifications_enabled?: boolean
          cnh_alert_enabled?: boolean
          fines_alert_enabled?: boolean
          discount_alert_enabled?: boolean
          ipva_alert_enabled?: boolean
          insurance_alert_enabled?: boolean
          maintenance_alert_enabled?: boolean
          ai_extract_documents?: boolean
          ai_financial_copilot?: boolean
          default_state?: string | null
          default_discount_percent?: number | null
          theme?: string | null
          language?: string | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notifications_enabled?: boolean
          cnh_alert_enabled?: boolean
          fines_alert_enabled?: boolean
          discount_alert_enabled?: boolean
          ipva_alert_enabled?: boolean
          insurance_alert_enabled?: boolean
          maintenance_alert_enabled?: boolean
          ai_extract_documents?: boolean
          ai_financial_copilot?: boolean
          default_state?: string | null
          default_discount_percent?: number | null
          theme?: string | null
          language?: string | null
          currency?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
