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
      dashboard_user_audit_logs: {
        Row: {
          action: string
          changes: Json
          entity_id: string
          entity_type: string
          id: string
          performed_at: string | null
          performed_by: string | null
        }
        Insert: {
          action: string
          changes: Json
          entity_id: string
          entity_type: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Update: {
          action?: string
          changes?: Json
          entity_id?: string
          entity_type?: string
          id?: string
          performed_at?: string | null
          performed_by?: string | null
        }
        Relationships: []
      }
      dashboard_users: {
        Row: {
          city: string | null
          cluster: string | null
          created_at: string | null
          created_by: string | null
          email: string
          employee_id: string | null
          id: string
          last_updated_by: string | null
          manager: string | null
          name: string
          password: string
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          cluster?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          employee_id?: string | null
          id?: string
          last_updated_by?: string | null
          manager?: string | null
          name: string
          password: string
          phone?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          cluster?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          employee_id?: string | null
          id?: string
          last_updated_by?: string | null
          manager?: string | null
          name?: string
          password?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          account_number: string | null
          blood_group: string | null
          city: string | null
          cluster: string | null
          created_at: string | null
          date_of_birth: string | null
          date_of_joining: string | null
          email: string
          emp_id: string
          id: string
          ifsc_code: string | null
          manager: string | null
          name: string
          password: string
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          account_number?: string | null
          blood_group?: string | null
          city?: string | null
          cluster?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          email: string
          emp_id: string
          id?: string
          ifsc_code?: string | null
          manager?: string | null
          name: string
          password: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          account_number?: string | null
          blood_group?: string | null
          city?: string | null
          cluster?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          email?: string
          emp_id?: string
          id?: string
          ifsc_code?: string | null
          manager?: string | null
          name?: string
          password?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      issue_audit_trail: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          employee_uuid: string
          id: string
          issue_id: string
          new_status: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          employee_uuid: string
          id?: string
          issue_id: string
          new_status?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          employee_uuid?: string
          id?: string
          issue_id?: string
          new_status?: string | null
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_audit_trail_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_comments: {
        Row: {
          content: string
          created_at: string
          employee_uuid: string
          id: string
          issue_id: string
        }
        Insert: {
          content: string
          created_at?: string
          employee_uuid: string
          id?: string
          issue_id: string
        }
        Update: {
          content?: string
          created_at?: string
          employee_uuid?: string
          id?: string
          issue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_internal_comments: {
        Row: {
          content: string
          created_at: string
          employee_uuid: string
          id: string
          issue_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          employee_uuid: string
          id?: string
          issue_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          employee_uuid?: string
          id?: string
          issue_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_internal_comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_notifications: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          issue_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          issue_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_notifications_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          assigned_to: string | null
          attachment_url: string | null
          attachments: string[] | null
          closed_at: string | null
          created_at: string
          description: string
          employee_uuid: string
          id: string
          mapped_at: string | null
          mapped_by: string | null
          mapped_sub_type_id: string | null
          mapped_type_id: string | null
          priority: string
          status: string
          sub_type_id: string
          type_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachment_url?: string | null
          attachments?: string[] | null
          closed_at?: string | null
          created_at?: string
          description: string
          employee_uuid: string
          id: string
          mapped_at?: string | null
          mapped_by?: string | null
          mapped_sub_type_id?: string | null
          mapped_type_id?: string | null
          priority: string
          status: string
          sub_type_id: string
          type_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachment_url?: string | null
          attachments?: string[] | null
          closed_at?: string | null
          created_at?: string
          description?: string
          employee_uuid?: string
          id?: string
          mapped_at?: string | null
          mapped_by?: string | null
          mapped_sub_type_id?: string | null
          mapped_type_id?: string | null
          priority?: string
          status?: string
          sub_type_id?: string
          type_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      master_audit_logs: {
        Row: {
          action: string
          changes: Json
          created_at: string
          created_by: string
          entity_id: string
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          changes: Json
          created_at?: string
          created_by: string
          entity_id: string
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          changes?: Json
          created_at?: string
          created_by?: string
          entity_id?: string
          entity_type?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_audit_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      master_cities: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      master_clusters: {
        Row: {
          city_id: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_clusters_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "master_cities"
            referencedColumns: ["id"]
          },
        ]
      }
      master_roles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rbac_permissions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rbac_role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rbac_role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "rbac_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rbac_role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "rbac_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      rbac_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      rbac_user_roles: {
        Row: {
          created_at: string
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rbac_user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "rbac_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_feedback: {
        Row: {
          agent_id: string | null
          agent_name: string | null
          city: string | null
          cluster: string | null
          created_at: string
          employee_uuid: string
          feedback_option: string
          id: string
          issue_id: string
          sentiment: string
        }
        Insert: {
          agent_id?: string | null
          agent_name?: string | null
          city?: string | null
          cluster?: string | null
          created_at?: string
          employee_uuid: string
          feedback_option: string
          id?: string
          issue_id: string
          sentiment: string
        }
        Update: {
          agent_id?: string | null
          agent_name?: string | null
          city?: string | null
          cluster?: string | null
          created_at?: string
          employee_uuid?: string
          feedback_option?: string
          id?: string
          issue_id?: string
          sentiment?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_feedback_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_permission: {
        Args: { target_user_id: string; target_permission_id: string }
        Returns: boolean
      }
      assign_permission_to_role: {
        Args: { role_name: string; permission_name: string }
        Returns: boolean
      }
      assign_role: {
        Args: { target_user_id: string; role_name: string }
        Returns: boolean
      }
      has_permission: {
        Args: { user_id: string; permission_name: string }
        Returns: boolean
      }
      has_role: {
        Args: { user_id: string; role_name: string }
        Returns: boolean
      }
      insert_dashboard_users_with_audit: {
        Args: { users_json: Json }
        Returns: Json
      }
      remove_permission_from_role: {
        Args: { role_name: string; permission_name: string }
        Returns: boolean
      }
      remove_role: {
        Args: { target_user_id: string; role_name: string }
        Returns: boolean
      }
      remove_user_permission: {
        Args: { target_user_id: string; target_permission_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "hr_admin" | "city_head" | "ops"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["hr_admin", "city_head", "ops"],
    },
  },
} as const
