export type Event = {
    id: number;
    title: string;
    description: string;
    event_date: string; // ISO-строка
    category: 'Концерт' | 'Спорт' | 'Кино' | 'Другое';
    created_at: string;
    creator_id: number;
  };
  
  export type User = {
    id: number;
    username: string;
    is_admin: boolean;
    registered_events: number[];
  };