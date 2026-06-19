import type { StoredChartData } from "@/types/birth"

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ChartRow {
  id: string
  user_id: string
  name: string
  birth_date: string
  birth_time: string
  birth_place: string
  chart_data: StoredChartData
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      charts: {
        Row: ChartRow
        Insert: {
          id?: string
          user_id: string
          name: string
          birth_date: string
          birth_time: string
          birth_place: string
          chart_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          birth_date?: string
          birth_time?: string
          birth_place?: string
          chart_data?: Json
          created_at?: string
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
