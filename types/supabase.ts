export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          ticker: string
          name: string
          cik: string | null
          sector: string | null
          industry: string | null
          market_cap: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticker: string
          name: string
          cik?: string | null
          sector?: string | null
          industry?: string | null
          market_cap?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticker?: string
          name?: string
          cik?: string | null
          sector?: string | null
          industry?: string | null
          market_cap?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      insiders: {
        Row: {
          id: string
          cik: string | null
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          cik?: string | null
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          cik?: string | null
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      insider_transactions: {
        Row: {
          id: string
          company_id: string
          insider_id: string
          accession_number: string
          filed_at: string
          transaction_date: string
          transaction_type: string
          shares: number | null
          price_per_share: number | null
          total_value: number | null
          shares_owned_after: number | null
          insider_title: string | null
          is_director: boolean
          is_officer: boolean
          is_ten_percent_owner: boolean
          is_10b5_1_plan: boolean
          ai_context: string | null
          ai_significance_score: number | null
          ai_generated_at: string | null
          raw_filing_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          insider_id: string
          accession_number: string
          filed_at: string
          transaction_date: string
          transaction_type: string
          shares?: number | null
          price_per_share?: number | null
          total_value?: number | null
          shares_owned_after?: number | null
          insider_title?: string | null
          is_director?: boolean
          is_officer?: boolean
          is_ten_percent_owner?: boolean
          is_10b5_1_plan?: boolean
          ai_context?: string | null
          ai_significance_score?: number | null
          ai_generated_at?: string | null
          raw_filing_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          insider_id?: string
          accession_number?: string
          filed_at?: string
          transaction_date?: string
          transaction_type?: string
          shares?: number | null
          price_per_share?: number | null
          total_value?: number | null
          shares_owned_after?: number | null
          insider_title?: string | null
          is_director?: boolean
          is_officer?: boolean
          is_ten_percent_owner?: boolean
          is_10b5_1_plan?: boolean
          ai_context?: string | null
          ai_significance_score?: number | null
          ai_generated_at?: string | null
          raw_filing_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insider_transactions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insider_transactions_insider_id_fkey"
            columns: ["insider_id"]
            isOneToOne: false
            referencedRelation: "insiders"
            referencedColumns: ["id"]
          }
        ]
      }
      institutions: {
        Row: {
          id: string
          cik: string
          name: string
          institution_type: string | null
          aum_estimate: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cik: string
          name: string
          institution_type?: string | null
          aum_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cik?: string
          name?: string
          institution_type?: string | null
          aum_estimate?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      institutional_filings: {
        Row: {
          id: string
          institution_id: string
          accession_number: string
          report_date: string
          filed_at: string
          total_value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          institution_id: string
          accession_number: string
          report_date: string
          filed_at: string
          total_value?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          institution_id?: string
          accession_number?: string
          report_date?: string
          filed_at?: string
          total_value?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_filings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          }
        ]
      }
      institutional_holdings: {
        Row: {
          id: string
          filing_id: string
          institution_id: string
          company_id: string
          report_date: string
          shares: number
          value: number
          percent_of_portfolio: number | null
          shares_change: number | null
          shares_change_percent: number | null
          is_new_position: boolean
          is_closed_position: boolean
          created_at: string
        }
        Insert: {
          id?: string
          filing_id: string
          institution_id: string
          company_id: string
          report_date: string
          shares: number
          value: number
          percent_of_portfolio?: number | null
          shares_change?: number | null
          shares_change_percent?: number | null
          is_new_position?: boolean
          is_closed_position?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          filing_id?: string
          institution_id?: string
          company_id?: string
          report_date?: string
          shares?: number
          value?: number
          percent_of_portfolio?: number | null
          shares_change?: number | null
          shares_change_percent?: number | null
          is_new_position?: boolean
          is_closed_position?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "institutional_holdings_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "institutional_filings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_holdings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "institutional_holdings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          subscription_tier: string
          stripe_customer_id: string | null
          notification_daily_digest: boolean
          notification_instant_alerts: boolean
          notification_weekly_summary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          notification_daily_digest?: boolean
          notification_instant_alerts?: boolean
          notification_weekly_summary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          subscription_tier?: string
          stripe_customer_id?: string | null
          notification_daily_digest?: boolean
          notification_instant_alerts?: boolean
          notification_weekly_summary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_prices: {
        Row: {
          id: string
          ticker: string
          price_date: string
          open: number | null
          high: number | null
          low: number | null
          close: number | null
          volume: number | null
          created_at: string
        }
        Insert: {
          id?: string
          ticker: string
          price_date: string
          open?: number | null
          high?: number | null
          low?: number | null
          close?: number | null
          volume?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          ticker?: string
          price_date?: string
          open?: number | null
          high?: number | null
          low?: number | null
          close?: number | null
          volume?: number | null
          created_at?: string
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          id: string
          user_id: string
          company_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      v_recent_insider_transactions: {
        Row: {
          id: string | null
          company_id: string | null
          insider_id: string | null
          accession_number: string | null
          filed_at: string | null
          transaction_date: string | null
          transaction_type: string | null
          shares: number | null
          price_per_share: number | null
          total_value: number | null
          shares_owned_after: number | null
          insider_title: string | null
          is_director: boolean | null
          is_officer: boolean | null
          is_ten_percent_owner: boolean | null
          is_10b5_1_plan: boolean | null
          ai_context: string | null
          ai_significance_score: number | null
          ai_generated_at: string | null
          raw_filing_url: string | null
          created_at: string | null
          ticker: string | null
          company_name: string | null
          insider_name: string | null
        }
        Relationships: []
      }
      v_institutional_holdings: {
        Row: {
          id: string | null
          filing_id: string | null
          institution_id: string | null
          company_id: string | null
          report_date: string | null
          shares: number | null
          value: number | null
          percent_of_portfolio: number | null
          shares_change: number | null
          shares_change_percent: number | null
          is_new_position: boolean | null
          is_closed_position: boolean | null
          created_at: string | null
          ticker: string | null
          company_name: string | null
          institution_name: string | null
          institution_type: string | null
        }
        Relationships: []
      }
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
