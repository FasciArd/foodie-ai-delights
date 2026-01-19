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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      drivers: {
        Row: {
          created_at: string
          current_latitude: number | null
          current_longitude: number | null
          id: string
          license_plate: string | null
          status: Database["public"]["Enums"]["driver_status"] | null
          updated_at: string
          user_id: string
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          license_plate?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          updated_at?: string
          user_id: string
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string
          current_latitude?: number | null
          current_longitude?: number | null
          id?: string
          license_plate?: string | null
          status?: Database["public"]["Enums"]["driver_status"] | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      menu_items: {
        Row: {
          calories: number | null
          category: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          is_available: boolean | null
          is_popular: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          calories?: number | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name: string
          price: number
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          calories?: number | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_available?: boolean | null
          is_popular?: boolean | null
          name?: string
          price?: number
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          delivery_address: string
          delivery_latitude: number | null
          delivery_longitude: number | null
          driver_id: string | null
          id: string
          items: Json
          notes: string | null
          restaurant_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_calories: number | null
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address: string
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          driver_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_calories?: number | null
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          driver_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total_calories?: number | null
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          status: Database["public"]["Enums"]["payment_status"] | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_orders: {
        Row: {
          created_at: string
          delivery_address: string
          id: string
          items: Json
          notes: string | null
          restaurant_id: string
          scheduled_date: string
          scheduled_time: string
          status: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_address: string
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id: string
          scheduled_date: string
          scheduled_time: string
          status?: string
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_address?: string
          id?: string
          items?: Json
          notes?: string | null
          restaurant_id?: string
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pre_orders_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_account: string | null
          bio: string | null
          business_license: string | null
          cnic: string | null
          created_at: string
          cuisine_type: string | null
          email: string
          emergency_contact: string | null
          id: string
          license_plate: string | null
          name: string
          operating_hours: string | null
          phone: string | null
          phone_verified: boolean | null
          profile_complete: boolean | null
          restaurant_name: string | null
          role: string | null
          updated_at: string
          user_id: string
          vehicle_type: string | null
          wallet_balance: number | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          bio?: string | null
          business_license?: string | null
          cnic?: string | null
          created_at?: string
          cuisine_type?: string | null
          email: string
          emergency_contact?: string | null
          id?: string
          license_plate?: string | null
          name: string
          operating_hours?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profile_complete?: boolean | null
          restaurant_name?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
          vehicle_type?: string | null
          wallet_balance?: number | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bank_account?: string | null
          bio?: string | null
          business_license?: string | null
          cnic?: string | null
          created_at?: string
          cuisine_type?: string | null
          email?: string
          emergency_contact?: string | null
          id?: string
          license_plate?: string | null
          name?: string
          operating_hours?: string | null
          phone?: string | null
          phone_verified?: boolean | null
          profile_complete?: boolean | null
          restaurant_name?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
          vehicle_type?: string | null
          wallet_balance?: number | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          address: string | null
          category: string
          created_at: string
          delivery_fee: number | null
          delivery_time: string | null
          description: string | null
          id: string
          image: string | null
          is_active: boolean | null
          latitude: number | null
          logo: string | null
          longitude: number | null
          name: string
          opening_hours: string | null
          owner_id: string | null
          rating: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          created_at?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo?: string | null
          longitude?: number | null
          name: string
          opening_hours?: string | null
          owner_id?: string | null
          rating?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          created_at?: string
          delivery_fee?: number | null
          delivery_time?: string | null
          description?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          latitude?: number | null
          logo?: string | null
          longitude?: number | null
          name?: string
          opening_hours?: string | null
          owner_id?: string | null
          rating?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          restaurant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          restaurant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          restaurant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      set_my_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      app_role: "customer" | "restaurant" | "driver" | "admin"
      driver_status: "available" | "busy" | "offline"
      order_status:
        | "pending"
        | "preparing"
        | "on_the_way"
        | "delivered"
        | "cancelled"
        | "ready_for_pickup"
        | "picked_up"
      payment_method: "easypaisa" | "jazzcash" | "stripe" | "cod"
      payment_status: "pending" | "success" | "failed"
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
      app_role: ["customer", "restaurant", "driver", "admin"],
      driver_status: ["available", "busy", "offline"],
      order_status: [
        "pending",
        "preparing",
        "on_the_way",
        "delivered",
        "cancelled",
        "ready_for_pickup",
        "picked_up",
      ],
      payment_method: ["easypaisa", "jazzcash", "stripe", "cod"],
      payment_status: ["pending", "success", "failed"],
    },
  },
} as const
