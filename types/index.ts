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
  total_events?: number;
  mutual_friends_count?: number;
};
export type FriendshipStatus = 'none' | 'friends' | 'incoming' | 'outgoing';

export type UserWithFriendshipStatus = User & {
  friendship_status: FriendshipStatus;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  category: 'Концерт' | 'Спорт' | 'Кино' |'БелГУТ'| 'Другое' | 'Выставка'| 'Образование'| 'Театр';
  created_at: string;
  creator: User; // ← теперь это объект User
  image_url?: string[];
  location: string;
  participants: User[];
  is_approved: boolean;
  is_favorite?: boolean;
  participants_count: number 
  joined?: boolean 
  url?: string;
};


export type BsutEvent = {
  title: string;
  image: string;
  date: string;
  event_link: string;
};


export type Comment = {
  id: number;
  text: string;
  created_at: string;
  parent_id: number | null;
  event_id: number;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}