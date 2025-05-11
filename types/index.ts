export type Event = {
    id: number;
    title: string;
    description: string;
    event_date: string; // ISO-строка
    category: 'Концерт' | 'Спорт' | 'Кино' | 'Другое';
    created_at: string;
    creator_id: number;
    image_url?: string;
    location: string;
    participants: number; 
    //status: 'pending' | 'approved' | 'rejected';
    is_approved: boolean;
    is_favorite?: boolean;
  };
  
  export type user = {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
    registered_events: number[];
    avatar_url?: string;
    created_at: string;
  };