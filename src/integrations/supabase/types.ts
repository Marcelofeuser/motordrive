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
          email: string | null
          id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          email?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          email?: string | null
          id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cnh: {
        Row: {
          categoria: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          ear: string | null
          file_path: string | null
          file_url: string | null
          id: string
          nome: string | null
          numero_registro: string | null
          observacoes: string | null
          orgao_emissor: string | null
          primeira_habilitacao: string | null
          updated_at: string
          user_id: string
          validade: string | null
        }
        Insert: {
          categoria?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          ear?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          nome?: string | null
          numero_registro?: string | null
          observacoes?: string | null
          orgao_emissor?: string | null
          primeira_habilitacao?: string | null
          updated_at?: string
          user_id: string
          validade?: string | null
        }
        Update: {
          categoria?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          ear?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          nome?: string | null
          numero_registro?: string | null
          observacoes?: string | null
          orgao_emissor?: string | null
          primeira_habilitacao?: string | null
          updated_at?: string
          user_id?: string
          validade?: string | null
        }
        Relationships: []
      }
      earnings: {
        Row: {
          bonus: number
          bruto: number
          corridas: number
          created_at: string
          date: string
          dinheiro: number
          gorjetas: number
          id: string
          outros: number
          pedagio: number
          platform: string
          taxas: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus?: number
          bruto?: number
          corridas?: number
          created_at?: string
          date?: string
          dinheiro?: number
          gorjetas?: number
          id?: string
          outros?: number
          pedagio?: number
          platform?: string
          taxas?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus?: number
          bruto?: number
          corridas?: number
          created_at?: string
          date?: string
          dinheiro?: number
          gorjetas?: number
          id?: string
          outros?: number
          pedagio?: number
          platform?: string
          taxas?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      earnings_imports: {
        Row: {
          created_at: string
          extracted_payload: Json | null
          file_name: string | null
          file_url: string | null
          id: string
          provider: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_payload?: Json | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          provider?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_payload?: Json | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          provider?: string
          status?: string
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
      integrations: {
        Row: {
          access_token: string | null
          account_label: string | null
          created_at: string
          id: string
          last_synced_at: string | null
          metadata: Json | null
          provider: string
          refresh_token: string | null
          scopes: string | null
          status: string
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_label?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          provider: string
          refresh_token?: string | null
          scopes?: string | null
          status?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_label?: string | null
          created_at?: string
          id?: string
          last_synced_at?: string | null
          metadata?: Json | null
          provider?: string
          refresh_token?: string | null
          scopes?: string | null
          status?: string
          token_expires_at?: string | null
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
      lucro_real: {
        Row: {
          category: string
          created_at: string
          id: string
          label: string
          type: string
          user_id: string
          value: number
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          label: string
          type: string
          user_id: string
          value?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          label?: string
          type?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      maintenance: {
        Row: {
          category: string
          created_at: string
          date: string
          id: string
          km: number | null
          obs: string | null
          tipo: string | null
          updated_at: string
          user_id: string
          valor: number
        }
        Insert: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          km?: number | null
          obs?: string | null
          tipo?: string | null
          updated_at?: string
          user_id: string
          valor?: number
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          id?: string
          km?: number | null
          obs?: string | null
          tipo?: string | null
          updated_at?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      manual_earnings: {
        Row: {
          bonuses: number | null
          created_at: string
          fees: number | null
          gross_earnings: number | null
          id: string
          net_earnings: number | null
          notes: string | null
          online_hours: number | null
          provider: string
          source_import_id: string | null
          trip_date: string | null
          user_id: string
        }
        Insert: {
          bonuses?: number | null
          created_at?: string
          fees?: number | null
          gross_earnings?: number | null
          id?: string
          net_earnings?: number | null
          notes?: string | null
          online_hours?: number | null
          provider?: string
          source_import_id?: string | null
          trip_date?: string | null
          user_id: string
        }
        Update: {
          bonuses?: number | null
          created_at?: string
          fees?: number | null
          gross_earnings?: number | null
          id?: string
          net_earnings?: number | null
          notes?: string | null
          online_hours?: number | null
          provider?: string
          source_import_id?: string | null
          trip_date?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "manual_earnings_source_import_id_fkey"
            columns: ["source_import_id"]
            isOneToOne: false
            referencedRelation: "earnings_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      multas: {
        Row: {
          auto_infracao: string | null
          created_at: string
          data_infracao: string | null
          desconto_percent: number | null
          descricao: string | null
          file_path: string | null
          file_url: string | null
          id: string
          raw_data: Json | null
          status: string | null
          user_id: string
          valor: number | null
          vencimento: string | null
        }
        Insert: {
          auto_infracao?: string | null
          created_at?: string
          data_infracao?: string | null
          desconto_percent?: number | null
          descricao?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          raw_data?: Json | null
          status?: string | null
          user_id: string
          valor?: number | null
          vencimento?: string | null
        }
        Update: {
          auto_infracao?: string | null
          created_at?: string
          data_infracao?: string | null
          desconto_percent?: number | null
          descricao?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          raw_data?: Json | null
          status?: string | null
          user_id?: string
          valor?: number | null
          vencimento?: string | null
        }
        Relationships: []
      }
      platform_imports: {
        Row: {
          bonuses: number
          created_at: string
          fees: number
          gross_earnings: number
          id: string
          net_earnings: number
          notes: string | null
          online_hours: number
          provider: string
          raw_data: Json | null
          source: string
          source_file: string | null
          trip_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bonuses?: number
          created_at?: string
          fees?: number
          gross_earnings?: number
          id?: string
          net_earnings?: number
          notes?: string | null
          online_hours?: number
          provider?: string
          raw_data?: Json | null
          source?: string
          source_file?: string | null
          trip_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bonuses?: number
          created_at?: string
          fees?: number
          gross_earnings?: number
          id?: string
          net_earnings?: number
          notes?: string | null
          online_hours?: number
          provider?: string
          raw_data?: Json | null
          source?: string
          source_file?: string | null
          trip_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          plan: string
          trial_ends_at: string | null
          trial_used: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: string
          trial_ends_at?: string | null
          trial_used?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: string
          trial_ends_at?: string | null
          trial_used?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservas: {
        Row: {
          ativo: boolean
          automatico: boolean
          cor: string
          created_at: string
          emoji: string
          frequencia: string
          id: string
          meta: number | null
          nome: string
          saldo: number
          tipo_aporte: string
          updated_at: string
          user_id: string
          valor_aporte: number
        }
        Insert: {
          ativo?: boolean
          automatico?: boolean
          cor?: string
          created_at?: string
          emoji?: string
          frequencia?: string
          id?: string
          meta?: number | null
          nome?: string
          saldo?: number
          tipo_aporte?: string
          updated_at?: string
          user_id: string
          valor_aporte?: number
        }
        Update: {
          ativo?: boolean
          automatico?: boolean
          cor?: string
          created_at?: string
          emoji?: string
          frequencia?: string
          id?: string
          meta?: number | null
          nome?: string
          saldo?: number
          tipo_aporte?: string
          updated_at?: string
          user_id?: string
          valor_aporte?: number
        }
        Relationships: []
      }
      reservas_historico: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          reserva_id: string
          tipo: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          reserva_id: string
          tipo: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          reserva_id?: string
          tipo?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "reservas_historico_reserva_id_fkey"
            columns: ["reserva_id"]
            isOneToOne: false
            referencedRelation: "reservas"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          ai_extract_documents: boolean
          ai_financial_copilot: boolean
          cnh_alert_enabled: boolean
          created_at: string
          currency: string | null
          default_discount_percent: number | null
          default_state: string | null
          discount_alert_enabled: boolean
          fines_alert_enabled: boolean
          id: string
          insurance_alert_enabled: boolean
          ipva_alert_enabled: boolean
          language: string | null
          maintenance_alert_enabled: boolean
          notifications_enabled: boolean
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_extract_documents?: boolean
          ai_financial_copilot?: boolean
          cnh_alert_enabled?: boolean
          created_at?: string
          currency?: string | null
          default_discount_percent?: number | null
          default_state?: string | null
          discount_alert_enabled?: boolean
          fines_alert_enabled?: boolean
          id?: string
          insurance_alert_enabled?: boolean
          ipva_alert_enabled?: boolean
          language?: string | null
          maintenance_alert_enabled?: boolean
          notifications_enabled?: boolean
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_extract_documents?: boolean
          ai_financial_copilot?: boolean
          cnh_alert_enabled?: boolean
          created_at?: string
          currency?: string | null
          default_discount_percent?: number | null
          default_state?: string | null
          discount_alert_enabled?: boolean
          fines_alert_enabled?: boolean
          id?: string
          insurance_alert_enabled?: boolean
          ipva_alert_enabled?: boolean
          language?: string | null
          maintenance_alert_enabled?: boolean
          notifications_enabled?: boolean
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      veiculo: {
        Row: {
          ano_fabricacao: string | null
          ano_modelo: string | null
          categoria: string | null
          chassi: string | null
          cilindrada: string | null
          combustivel: string | null
          cor: string | null
          cpf_cnpj: string | null
          created_at: string
          estado: string | null
          file_path: string | null
          file_url: string | null
          id: string
          marca: string | null
          modelo: string | null
          municipio: string | null
          placa: string | null
          potencia: string | null
          proprietario: string | null
          renavam: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ano_fabricacao?: string | null
          ano_modelo?: string | null
          categoria?: string | null
          chassi?: string | null
          cilindrada?: string | null
          combustivel?: string | null
          cor?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          estado?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          municipio?: string | null
          placa?: string | null
          potencia?: string | null
          proprietario?: string | null
          renavam?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ano_fabricacao?: string | null
          ano_modelo?: string | null
          categoria?: string | null
          chassi?: string | null
          cilindrada?: string | null
          combustivel?: string | null
          cor?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          estado?: string | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          municipio?: string | null
          placa?: string | null
          potencia?: string | null
          proprietario?: string | null
          renavam?: string | null
          updated_at?: string
          user_id?: string
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
