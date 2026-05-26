export type EventRow = {
  id: string;
  slug: string;
  name: string;
  event_date: string | null;
  access_token: string;
  created_at: string;
};

export type EventInsert = {
  slug: string;
  name: string;
  event_date?: string | null;
  access_token?: string;
};

export type PhotoRow = {
  id: string;
  event_id: string;
  storage_path: string;
  author_session: string | null;
  created_at: string;
};

export type PhotoInsert = {
  event_id: string;
  storage_path: string;
  author_session?: string | null;
};

export type Database = {
  public: {
    Tables: {
      events: {
        Row: EventRow;
        Insert: EventInsert;
        Update: Partial<EventInsert>;
        Relationships: [];
      };
      photos: {
        Row: PhotoRow;
        Insert: PhotoInsert;
        Update: Partial<PhotoInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Event = EventRow;
export type Photo = PhotoRow;
