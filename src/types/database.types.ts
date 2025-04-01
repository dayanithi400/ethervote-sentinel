
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          voter_id: string
          district: string
          constituency: string
          email: string
          phone: string
          wallet_address: string
          has_voted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          voter_id: string
          district: string
          constituency: string
          email: string
          phone: string
          wallet_address: string
          has_voted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          voter_id?: string
          district?: string
          constituency?: string
          email?: string
          phone?: string
          wallet_address?: string
          has_voted?: boolean
          created_at?: string
        }
      }
      districts: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      constituencies: {
        Row: {
          id: string
          name: string
          district_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          district_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          district_id?: string
          created_at?: string
        }
      }
      candidates: {
        Row: {
          id: string
          name: string
          party: string
          district_id: string
          constituency_id: string
          symbol: string
          vote_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          party: string
          district_id: string
          constituency_id: string
          symbol: string
          vote_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          party?: string
          district_id?: string
          constituency_id?: string
          symbol?: string
          vote_count?: number
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          voter_id: string
          candidate_id: string
          district_id: string
          constituency_id: string
          timestamp: string
          transaction_hash: string
        }
        Insert: {
          id?: string
          voter_id: string
          candidate_id: string
          district_id: string
          constituency_id: string
          timestamp?: string
          transaction_hash: string
        }
        Update: {
          id?: string
          voter_id?: string
          candidate_id?: string
          district_id?: string
          constituency_id?: string
          timestamp?: string
          transaction_hash?: string
        }
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
  }
}
