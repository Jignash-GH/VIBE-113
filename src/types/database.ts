export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          learning_level: 'spoonfeeder' | 'well-idea' | null;
          coding_level: number;
          social_feeds: Record<string, string>;
          goal_description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          learning_level?: 'spoonfeeder' | 'well-idea' | null;
          coding_level?: number;
          social_feeds?: Record<string, string>;
          goal_description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          learning_level?: 'spoonfeeder' | 'well-idea' | null;
          coding_level?: number;
          social_feeds?: Record<string, string>;
          goal_description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          coding_level_score: number;
          coding_proficiency_score: number;
          decision_making_score: number;
          cgpa: number;
          real_life_application_score: number;
          total_score: number;
          category: 'spoonfeeder' | 'well-idea';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          coding_level_score: number;
          coding_proficiency_score: number;
          decision_making_score: number;
          cgpa: number;
          real_life_application_score: number;
          total_score: number;
          category: 'spoonfeeder' | 'well-idea';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          coding_level_score?: number;
          coding_proficiency_score?: number;
          decision_making_score?: number;
          cgpa?: number;
          real_life_application_score?: number;
          total_score?: number;
          category?: 'spoonfeeder' | 'well-idea';
          created_at?: string;
        };
      };
      learning_progress: {
        Row: {
          id: string;
          user_id: string;
          concept_name: string;
          concept_description: string;
          is_completed: boolean;
          difficulty_level: 'beginner' | 'advanced';
          order_index: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          concept_name: string;
          concept_description: string;
          is_completed?: boolean;
          difficulty_level: 'beginner' | 'advanced';
          order_index?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          concept_name?: string;
          concept_description?: string;
          is_completed?: boolean;
          difficulty_level?: 'beginner' | 'advanced';
          order_index?: number;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      coding_platforms: {
        Row: {
          id: string;
          user_id: string;
          platform: 'codechef' | 'leetcode';
          username: string;
          contest_rank: number;
          star_rating: number;
          current_division: string;
          goal: string;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: 'codechef' | 'leetcode';
          username: string;
          contest_rank?: number;
          star_rating?: number;
          current_division?: string;
          goal?: string;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: 'codechef' | 'leetcode';
          username?: string;
          contest_rank?: number;
          star_rating?: number;
          current_division?: string;
          goal?: string;
          last_updated?: string;
        };
      };
      concept_requests: {
        Row: {
          id: string;
          user_id: string;
          concept_name: string;
          reason: string;
          is_processed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          concept_name: string;
          reason?: string;
          is_processed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          concept_name?: string;
          reason?: string;
          is_processed?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
