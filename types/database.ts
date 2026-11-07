export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: string;
          full_name: string | null;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          role: string;
          full_name?: string;
          email?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          full_name?: string;
          email?: string;
          created_at?: string;
        };
      };
      suppliers: {
        Row: { id: string; name: string; country: string | null; created_at: string };
        Insert: { id?: string; name: string; country?: string; created_at?: string };
        Update: { id?: string; name?: string; country?: string; created_at?: string };
      };
      shipments: {
        Row: {
          id: string;
          shipment_number: string;
          supplier_id: string | null;
          status: string;
          invoice_number: string | null;
          invoice_date: string | null;
          currency: string | null;
          incoterm: string | null;
          gross_weight_kg: number | null;
          net_weight_kg: number | null;
          total_packages: number | null;
          containers: string[] | null;
          bl_number: string | null;
          vessel: string | null;
          port_of_loading: string | null;
          port_of_discharge: string | null;
          created_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          approval_reason: string | null;
          exported_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_number: string;
          supplier_id?: string;
          status?: string;
          invoice_number?: string;
          invoice_date?: string;
          currency?: string;
          incoterm?: string;
          gross_weight_kg?: number;
          net_weight_kg?: number;
          total_packages?: number;
          containers?: string[];
          bl_number?: string;
          vessel?: string;
          port_of_loading?: string;
          port_of_discharge?: string;
          created_by?: string;
          approved_by?: string;
          approved_at?: string;
          approval_reason?: string;
          exported_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shipment_number?: string;
          supplier_id?: string;
          status?: string;
          invoice_number?: string;
          invoice_date?: string;
          currency?: string;
          incoterm?: string;
          gross_weight_kg?: number;
          net_weight_kg?: number;
          total_packages?: number;
          containers?: string[];
          bl_number?: string;
          vessel?: string;
          port_of_loading?: string;
          port_of_discharge?: string;
          created_by?: string;
          approved_by?: string;
          approved_at?: string;
          approval_reason?: string;
          exported_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          shipment_id: string;
          type: string;
          storage_path: string;
          file_name: string;
          file_size: number | null;
          mime_type: string | null;
          status: string;
          extraction_attempts: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          type: string;
          storage_path: string;
          file_name: string;
          file_size?: number;
          mime_type?: string;
          status?: string;
          extraction_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          type?: string;
          storage_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          status?: string;
          extraction_attempts?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      extractions: {
        Row: { id: string; document_id: string; raw_json: Json; model: string; created_at: string };
        Insert: { id?: string; document_id: string; raw_json: Json; model: string; created_at?: string };
        Update: { id?: string; document_id?: string; raw_json?: Json; model?: string; created_at?: string };
      };
      fields: {
        Row: {
          id: string;
          shipment_id: string;
          document_id: string | null;
          key: string;
          value: string | null;
          ai_value: string | null;
          confidence: number | null;
          status: string;
          source_page: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          document_id?: string;
          key: string;
          value?: string;
          ai_value?: string;
          confidence?: number;
          status?: string;
          source_page?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          document_id?: string;
          key?: string;
          value?: string;
          ai_value?: string;
          confidence?: number;
          status?: string;
          source_page?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      line_items: {
        Row: {
          id: string;
          shipment_id: string;
          document_id: string | null;
          description: string | null;
          hsn: string | null;
          qty: number | null;
          unit_price: number | null;
          line_total: number | null;
          confidence: number | null;
          status: string | null;
          source_page: number | null;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          document_id?: string;
          description?: string;
          hsn?: string;
          qty?: number;
          unit_price?: number;
          line_total?: number;
          confidence?: number;
          status?: string;
          source_page?: number;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          document_id?: string;
          description?: string;
          hsn?: string;
          qty?: number;
          unit_price?: number;
          line_total?: number;
          confidence?: number;
          status?: string;
          source_page?: number;
        };
      };
      crosscheck_results: {
        Row: {
          id: string;
          shipment_id: string;
          check_type: string;
          status: string;
          value_a: string | null;
          value_b: string | null;
          delta: string | null;
          fields_involved: string[] | null;
          details: Json;
          resolved_by: string | null;
          resolved_at: string | null;
          resolution_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          check_type: string;
          status: string;
          value_a?: string;
          value_b?: string;
          delta?: string;
          fields_involved?: string[];
          details?: Json;
          resolved_by?: string;
          resolved_at?: string;
          resolution_note?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          check_type?: string;
          status?: string;
          value_a?: string;
          value_b?: string;
          delta?: string;
          fields_involved?: string[];
          details?: Json;
          resolved_by?: string;
          resolved_at?: string;
          resolution_note?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      field_edits: {
        Row: {
          id: string;
          shipment_id: string;
          field_key: string;
          document_id: string | null;
          old_value: string | null;
          new_value: string | null;
          action: string;
          user_id: string;
          supplier_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          field_key: string;
          document_id?: string;
          old_value?: string;
          new_value?: string;
          action: string;
          user_id: string;
          supplier_id?: string;
          created_at?: string;
        };
        Update: never;
      };
      approvals: {
        Row: { id: string; shipment_id: string; approver_id: string; decision: string; reason: string | null; created_at: string };
        Insert: { id?: string; shipment_id: string; approver_id: string; decision: string; reason?: string; created_at?: string };
        Update: { id?: string; shipment_id?: string; approver_id?: string; decision?: string; reason?: string; created_at?: string };
      };
      exports: {
        Row: { id: string; shipment_id: string; exported_by: string; file_path: string | null; created_at: string };
        Insert: { id?: string; shipment_id: string; exported_by: string; file_path?: string; created_at?: string };
        Update: { id?: string; shipment_id?: string; exported_by?: string; file_path?: string; created_at?: string };
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      current_app_role: { Args: {}; Returns: string };
      shipment_approve: { Args: { p_shipment_id: string; p_decision: string; p_reason: string }; Returns: void };
      shipment_export: { Args: { p_shipment_id: string }; Returns: void };
      set_updated_at: { Args: {}; Returns: unknown };
      reset_approval_on_edit: { Args: {}; Returns: unknown };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
