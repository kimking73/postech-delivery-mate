export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      banned_words: {
        Row: {
          created_at: string;
          word: string;
        };
        Insert: {
          created_at?: string;
          word: string;
        };
        Update: {
          created_at?: string;
          word?: string;
        };
        Relationships: [];
      };
      blocks: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blocks_blocked_id_fkey';
            columns: ['blocked_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blocks_blocker_id_fkey';
            columns: ['blocker_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      categories: {
        Row: {
          emoji: string | null;
          id: number;
          name: string;
          sort_order: number;
        };
        Insert: {
          emoji?: string | null;
          id?: number;
          name: string;
          sort_order?: number;
        };
        Update: {
          emoji?: string | null;
          id?: number;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      category_subscriptions: {
        Row: {
          category_id: number;
          created_at: string;
          user_id: string;
          zone_id: number;
        };
        Insert: {
          category_id: number;
          created_at?: string;
          user_id: string;
          zone_id: number;
        };
        Update: {
          category_id?: number;
          created_at?: string;
          user_id?: string;
          zone_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'category_subscriptions_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'category_subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'category_subscriptions_zone_id_fkey';
            columns: ['zone_id'];
            isOneToOne: false;
            referencedRelation: 'zones';
            referencedColumns: ['id'];
          },
        ];
      };
      deleted_accounts: {
        Row: {
          deleted_at: string;
          email_hash: string;
          noshow_count: number;
        };
        Insert: {
          deleted_at?: string;
          email_hash: string;
          noshow_count?: number;
        };
        Update: {
          deleted_at?: string;
          email_hash?: string;
          noshow_count?: number;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          body: string;
          client_msg_id: string | null;
          created_at: string;
          hidden_at: string | null;
          id: number;
          post_id: string;
          sender_id: string | null;
          type: Database['public']['Enums']['message_type'];
        };
        Insert: {
          body: string;
          client_msg_id?: string | null;
          created_at?: string;
          hidden_at?: string | null;
          id?: never;
          post_id: string;
          sender_id?: string | null;
          type?: Database['public']['Enums']['message_type'];
        };
        Update: {
          body?: string;
          client_msg_id?: string | null;
          created_at?: string;
          hidden_at?: string | null;
          id?: never;
          post_id?: string;
          sender_id?: string | null;
          type?: Database['public']['Enums']['message_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'messages_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      participants: {
        Row: {
          joined_at: string;
          last_read_message_id: number;
          left_at: string | null;
          muted: boolean;
          paid_at: string | null;
          paid_state: Database['public']['Enums']['paid_state'];
          post_id: string;
          role: Database['public']['Enums']['participant_role'];
          state: Database['public']['Enums']['participant_state'];
          user_id: string;
        };
        Insert: {
          joined_at?: string;
          last_read_message_id?: number;
          left_at?: string | null;
          muted?: boolean;
          paid_at?: string | null;
          paid_state?: Database['public']['Enums']['paid_state'];
          post_id: string;
          role?: Database['public']['Enums']['participant_role'];
          state?: Database['public']['Enums']['participant_state'];
          user_id: string;
        };
        Update: {
          joined_at?: string;
          last_read_message_id?: number;
          left_at?: string | null;
          muted?: boolean;
          paid_at?: string | null;
          paid_state?: Database['public']['Enums']['paid_state'];
          post_id?: string;
          role?: Database['public']['Enums']['participant_role'];
          state?: Database['public']['Enums']['participant_state'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'participants_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'participants_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payout_accounts: {
        Row: {
          account_holder: string | null;
          account_number: string | null;
          bank_name: string | null;
          toss_link: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          account_holder?: string | null;
          account_number?: string | null;
          bank_name?: string | null;
          toss_link?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_holder?: string | null;
          account_number?: string | null;
          bank_name?: string | null;
          toss_link?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payout_accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      pickup_places: {
        Row: {
          id: number;
          is_active: boolean;
          name: string;
          sort_order: number;
          zone_id: number;
        };
        Insert: {
          id?: number;
          is_active?: boolean;
          name: string;
          sort_order?: number;
          zone_id: number;
        };
        Update: {
          id?: number;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
          zone_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'pickup_places_zone_id_fkey';
            columns: ['zone_id'];
            isOneToOne: false;
            referencedRelation: 'zones';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          canceled_at: string | null;
          category_id: number;
          closed_at: string | null;
          completed_at: string | null;
          created_at: string;
          deadline_at: string;
          fee_note: string | null;
          hidden_at: string | null;
          host_id: string;
          id: string;
          max_members: number;
          member_count: number;
          memo: string | null;
          pay_due_at: string | null;
          pay_reminded_at: string | null;
          pickup_note: string | null;
          pickup_place_id: number;
          status: Database['public']['Enums']['post_status'];
          store_name: string;
          store_url: string | null;
          zone_id: number;
        };
        Insert: {
          canceled_at?: string | null;
          category_id: number;
          closed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          deadline_at: string;
          fee_note?: string | null;
          hidden_at?: string | null;
          host_id: string;
          id?: string;
          max_members: number;
          member_count?: number;
          memo?: string | null;
          pay_due_at?: string | null;
          pay_reminded_at?: string | null;
          pickup_note?: string | null;
          pickup_place_id: number;
          status?: Database['public']['Enums']['post_status'];
          store_name: string;
          store_url?: string | null;
          zone_id: number;
        };
        Update: {
          canceled_at?: string | null;
          category_id?: number;
          closed_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          deadline_at?: string;
          fee_note?: string | null;
          hidden_at?: string | null;
          host_id?: string;
          id?: string;
          max_members?: number;
          member_count?: number;
          memo?: string | null;
          pay_due_at?: string | null;
          pay_reminded_at?: string | null;
          pickup_note?: string | null;
          pickup_place_id?: number;
          status?: Database['public']['Enums']['post_status'];
          store_name?: string;
          store_url?: string | null;
          zone_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_pickup_place_id_zone_id_fkey';
            columns: ['pickup_place_id', 'zone_id'];
            isOneToOne: false;
            referencedRelation: 'pickup_places';
            referencedColumns: ['id', 'zone_id'];
          },
          {
            foreignKeyName: 'posts_zone_id_fkey';
            columns: ['zone_id'];
            isOneToOne: false;
            referencedRelation: 'zones';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          deleted_at: string | null;
          eula_agreed_at: string | null;
          home_zone_id: number | null;
          id: string;
          is_admin: boolean;
          nickname: string;
          noshow_count: number;
          notify_chat: boolean;
          notify_marketing: boolean;
          notify_post_events: boolean;
          terms_agreed_at: string | null;
          verified_at: string | null;
        };
        Insert: {
          created_at?: string;
          deleted_at?: string | null;
          eula_agreed_at?: string | null;
          home_zone_id?: number | null;
          id: string;
          is_admin?: boolean;
          nickname: string;
          noshow_count?: number;
          notify_chat?: boolean;
          notify_marketing?: boolean;
          notify_post_events?: boolean;
          terms_agreed_at?: string | null;
          verified_at?: string | null;
        };
        Update: {
          created_at?: string;
          deleted_at?: string | null;
          eula_agreed_at?: string | null;
          home_zone_id?: number | null;
          id?: string;
          is_admin?: boolean;
          nickname?: string;
          noshow_count?: number;
          notify_chat?: boolean;
          notify_marketing?: boolean;
          notify_post_events?: boolean;
          terms_agreed_at?: string | null;
          verified_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_home_zone_id_fkey';
            columns: ['home_zone_id'];
            isOneToOne: false;
            referencedRelation: 'zones';
            referencedColumns: ['id'];
          },
        ];
      };
      push_tokens: {
        Row: {
          expo_token: string;
          id: string;
          platform: Database['public']['Enums']['push_platform'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          expo_token: string;
          id?: string;
          platform: Database['public']['Enums']['push_platform'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          expo_token?: string;
          id?: string;
          platform?: Database['public']['Enums']['push_platform'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'push_tokens_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      rate_events: {
        Row: {
          action: string;
          created_at: string;
          id: number;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: never;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: never;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rate_events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          created_at: string;
          detail: string | null;
          handled_at: string | null;
          handled_by: string | null;
          id: string;
          reason: Database['public']['Enums']['report_reason'];
          reporter_id: string;
          status: Database['public']['Enums']['report_status'];
          target_message_id: number | null;
          target_post_id: string | null;
          target_type: Database['public']['Enums']['report_target'];
          target_user_id: string | null;
        };
        Insert: {
          created_at?: string;
          detail?: string | null;
          handled_at?: string | null;
          handled_by?: string | null;
          id?: string;
          reason: Database['public']['Enums']['report_reason'];
          reporter_id: string;
          status?: Database['public']['Enums']['report_status'];
          target_message_id?: number | null;
          target_post_id?: string | null;
          target_type: Database['public']['Enums']['report_target'];
          target_user_id?: string | null;
        };
        Update: {
          created_at?: string;
          detail?: string | null;
          handled_at?: string | null;
          handled_by?: string | null;
          id?: string;
          reason?: Database['public']['Enums']['report_reason'];
          reporter_id?: string;
          status?: Database['public']['Enums']['report_status'];
          target_message_id?: number | null;
          target_post_id?: string | null;
          target_type?: Database['public']['Enums']['report_target'];
          target_user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_handled_by_fkey';
            columns: ['handled_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_target_message_id_fkey';
            columns: ['target_message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_target_post_id_fkey';
            columns: ['target_post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_target_user_id_fkey';
            columns: ['target_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      sanctions: {
        Row: {
          created_at: string;
          created_by: string | null;
          ends_at: string | null;
          id: string;
          reason: string | null;
          starts_at: string;
          type: Database['public']['Enums']['sanction_type'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          ends_at?: string | null;
          id?: string;
          reason?: string | null;
          starts_at?: string;
          type: Database['public']['Enums']['sanction_type'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          ends_at?: string | null;
          id?: string;
          reason?: string | null;
          starts_at?: string;
          type?: Database['public']['Enums']['sanction_type'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sanctions_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sanctions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      zones: {
        Row: {
          id: number;
          is_active: boolean;
          name: string;
          sort_order: number;
        };
        Insert: {
          id?: number;
          is_active?: boolean;
          name: string;
          sort_order?: number;
        };
        Update: {
          id?: number;
          is_active?: boolean;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      assert_clean: { Args: { p_text: string }; Returns: undefined };
      assert_member: {
        Args: { p_require_profile?: boolean };
        Returns: undefined;
      };
      assert_rate: {
        Args: { p_action: string; p_max: number; p_window: unknown };
        Returns: undefined;
      };
      block_user: { Args: { user_id: string }; Returns: undefined };
      can_view_payout: { Args: { p_post: string }; Returns: boolean };
      cancel_post: {
        Args: { post_id: string; reason?: string };
        Returns: {
          canceled_at: string | null;
          category_id: number;
          closed_at: string | null;
          completed_at: string | null;
          created_at: string;
          deadline_at: string;
          fee_note: string | null;
          hidden_at: string | null;
          host_id: string;
          id: string;
          max_members: number;
          member_count: number;
          memo: string | null;
          pay_due_at: string | null;
          pay_reminded_at: string | null;
          pickup_note: string | null;
          pickup_place_id: number;
          status: Database['public']['Enums']['post_status'];
          store_name: string;
          store_url: string | null;
          zone_id: number;
        };
        SetofOptions: {
          from: '*';
          to: 'posts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      close_post: {
        Args: { post_id: string };
        Returns: {
          canceled_at: string | null;
          category_id: number;
          closed_at: string | null;
          completed_at: string | null;
          created_at: string;
          deadline_at: string;
          fee_note: string | null;
          hidden_at: string | null;
          host_id: string;
          id: string;
          max_members: number;
          member_count: number;
          memo: string | null;
          pay_due_at: string | null;
          pay_reminded_at: string | null;
          pickup_note: string | null;
          pickup_place_id: number;
          status: Database['public']['Enums']['post_status'];
          store_name: string;
          store_url: string | null;
          zone_id: number;
        };
        SetofOptions: {
          from: '*';
          to: 'posts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      complete_post: {
        Args: { post_id: string };
        Returns: {
          canceled_at: string | null;
          category_id: number;
          closed_at: string | null;
          completed_at: string | null;
          created_at: string;
          deadline_at: string;
          fee_note: string | null;
          hidden_at: string | null;
          host_id: string;
          id: string;
          max_members: number;
          member_count: number;
          memo: string | null;
          pay_due_at: string | null;
          pay_reminded_at: string | null;
          pickup_note: string | null;
          pickup_place_id: number;
          status: Database['public']['Enums']['post_status'];
          store_name: string;
          store_url: string | null;
          zone_id: number;
        };
        SetofOptions: {
          from: '*';
          to: 'posts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      confirm_paid: {
        Args: { post_id: string; user_id: string };
        Returns: undefined;
      };
      create_post: {
        Args: {
          category_id: number;
          deadline_minutes: number;
          fee_note?: string;
          max_members: number;
          memo?: string;
          pickup_note?: string;
          pickup_place_id: number;
          store_name: string;
          store_url?: string;
          zone_id: number;
        };
        Returns: {
          canceled_at: string | null;
          category_id: number;
          closed_at: string | null;
          completed_at: string | null;
          created_at: string;
          deadline_at: string;
          fee_note: string | null;
          hidden_at: string | null;
          host_id: string;
          id: string;
          max_members: number;
          member_count: number;
          memo: string | null;
          pay_due_at: string | null;
          pay_reminded_at: string | null;
          pickup_note: string | null;
          pickup_place_id: number;
          status: Database['public']['Enums']['post_status'];
          store_name: string;
          store_url: string | null;
          zone_id: number;
        };
        SetofOptions: {
          from: '*';
          to: 'posts';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      create_profile: {
        Args: {
          agree_eula: boolean;
          agree_terms: boolean;
          home_zone_id: number;
          nickname: string;
        };
        Returns: {
          created_at: string;
          deleted_at: string | null;
          eula_agreed_at: string | null;
          home_zone_id: number | null;
          id: string;
          is_admin: boolean;
          nickname: string;
          noshow_count: number;
          notify_chat: boolean;
          notify_marketing: boolean;
          notify_post_events: boolean;
          terms_agreed_at: string | null;
          verified_at: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'profiles';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      email_pepper: { Args: never; Returns: string };
      get_feed: {
        Args: {
          cursor_deadline?: string;
          cursor_id?: string;
          limit?: number;
          zone_id: number;
        };
        Returns: {
          category_id: number;
          created_at: string;
          deadline_at: string;
          fee_note: string;
          host_id: string;
          host_nickname: string;
          id: string;
          max_members: number;
          member_count: number;
          memo: string;
          pickup_note: string;
          pickup_place_id: number;
          status: Database['public']['Enums']['post_status'];
          store_name: string;
          store_url: string;
        }[];
      };
      get_host_account: {
        Args: { post_id: string };
        Returns: {
          account_holder: string;
          account_number: string;
          bank_name: string;
          toss_link: string;
        }[];
      };
      get_messages: {
        Args: {
          after_id?: number;
          before_id?: number;
          limit?: number;
          post_id: string;
        };
        Returns: {
          body: string;
          client_msg_id: string | null;
          created_at: string;
          hidden_at: string | null;
          id: number;
          post_id: string;
          sender_id: string | null;
          type: Database['public']['Enums']['message_type'];
        }[];
        SetofOptions: {
          from: '*';
          to: 'messages';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_my_rooms: {
        Args: never;
        Returns: {
          category_id: number;
          deadline_at: string;
          last_message_at: string;
          last_message_body: string;
          last_message_id: number;
          last_message_type: Database['public']['Enums']['message_type'];
          max_members: number;
          member_count: number;
          muted: boolean;
          paid_state: Database['public']['Enums']['paid_state'];
          pay_due_at: string;
          post_id: string;
          role: Database['public']['Enums']['participant_role'];
          status: Database['public']['Enums']['post_status'];
          store_name: string;
          unread_count: number;
        }[];
      };
      hook_before_user_created: { Args: { event: Json }; Returns: Json };
      is_blocked_between: { Args: { a: string; b: string }; Returns: boolean };
      is_participant: { Args: { p_post: string }; Returns: boolean };
      is_sanctioned: { Args: { uid: string }; Returns: boolean };
      is_verified_member: { Args: never; Returns: boolean };
      join_post: {
        Args: { post_id: string };
        Returns: {
          joined_at: string;
          last_read_message_id: number;
          left_at: string | null;
          muted: boolean;
          paid_at: string | null;
          paid_state: Database['public']['Enums']['paid_state'];
          post_id: string;
          role: Database['public']['Enums']['participant_role'];
          state: Database['public']['Enums']['participant_state'];
          user_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'participants';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      kick_member: {
        Args: { post_id: string; user_id: string };
        Returns: undefined;
      };
      leave_post: { Args: { post_id: string }; Returns: undefined };
      mark_paid: { Args: { post_id: string }; Returns: undefined };
      mark_read: {
        Args: { message_id: number; post_id: string };
        Returns: undefined;
      };
      register_push_token: {
        Args: {
          platform: Database['public']['Enums']['push_platform'];
          token: string;
        };
        Returns: undefined;
      };
      reject_paid: {
        Args: { post_id: string; user_id: string };
        Returns: undefined;
      };
      report: {
        Args: {
          detail?: string;
          post_id?: string;
          reason: Database['public']['Enums']['report_reason'];
          target_id: string;
          target_type: Database['public']['Enums']['report_target'];
        };
        Returns: undefined;
      };
      send_message: {
        Args: { body: string; client_msg_id: string; post_id: string };
        Returns: {
          body: string;
          client_msg_id: string | null;
          created_at: string;
          hidden_at: string | null;
          id: number;
          post_id: string;
          sender_id: string | null;
          type: Database['public']['Enums']['message_type'];
        };
        SetofOptions: {
          from: '*';
          to: 'messages';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      set_payout_account: {
        Args: {
          account_holder?: string;
          account_number?: string;
          bank_name?: string;
          toss_link?: string;
        };
        Returns: undefined;
      };
      subscribe_category: {
        Args: { category_id: number; zone_id: number };
        Returns: undefined;
      };
      unblock_user: { Args: { user_id: string }; Returns: undefined };
      unsubscribe_category: {
        Args: { category_id: number; zone_id: number };
        Returns: undefined;
      };
      update_profile: {
        Args: {
          home_zone_id?: number;
          nickname?: string;
          notify_chat?: boolean;
          notify_marketing?: boolean;
          notify_post_events?: boolean;
        };
        Returns: {
          created_at: string;
          deleted_at: string | null;
          eula_agreed_at: string | null;
          home_zone_id: number | null;
          id: string;
          is_admin: boolean;
          nickname: string;
          noshow_count: number;
          notify_chat: boolean;
          notify_marketing: boolean;
          notify_post_events: boolean;
          terms_agreed_at: string | null;
          verified_at: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'profiles';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
    };
    Enums: {
      message_type: 'text' | 'system';
      paid_state: 'none' | 'sent' | 'confirmed';
      participant_role: 'host' | 'member';
      participant_state: 'joined' | 'left' | 'dropped' | 'kicked';
      post_status: 'open' | 'closed' | 'completed' | 'canceled';
      push_platform: 'ios' | 'android';
      report_reason: 'spam' | 'abuse' | 'scam' | 'inappropriate' | 'noshow' | 'unpaid' | 'other';
      report_status: 'pending' | 'actioned' | 'dismissed';
      report_target: 'post' | 'message' | 'user' | 'noshow';
      sanction_type: 'warn' | 'suspend' | 'ban';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      message_type: ['text', 'system'],
      paid_state: ['none', 'sent', 'confirmed'],
      participant_role: ['host', 'member'],
      participant_state: ['joined', 'left', 'dropped', 'kicked'],
      post_status: ['open', 'closed', 'completed', 'canceled'],
      push_platform: ['ios', 'android'],
      report_reason: ['spam', 'abuse', 'scam', 'inappropriate', 'noshow', 'unpaid', 'other'],
      report_status: ['pending', 'actioned', 'dismissed'],
      report_target: ['post', 'message', 'user', 'noshow'],
      sanction_type: ['warn', 'suspend', 'ban'],
    },
  },
} as const;
