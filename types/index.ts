export type User = {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  registered_events: number[];
  avatar_url?: string;
  created_at: string;
  first_name: string;
  last_name: string;
  total_events: number;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  category: 'Концерт' | 'Спорт' | 'Кино' | 'Другое';
  created_at: string;
  creator: User; // ← теперь это объект User
  image_url?: string[];
  location: string;
  participants: User[];
  is_approved: boolean;
  is_favorite?: boolean;
  participants_count: number 
  joined?: boolean 
};
