export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'COORDINATOR' | 'PHOTOGRAPHER' | 'MEMBER' | 'PUBLIC';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password2: string;
}

export interface Event {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  description: string;
  cover_photo: string;
  is_public: boolean;
  created_at: string;
  created_by: number;
  images?: Image[];
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
  image_count?: number;
}

export interface UserTag {
  id: number;
  user_id: number;
  username: string;
  added_by?: string;
  added_at?: string;
}


export interface Image {
  id: number;
  event: number;
  uploaded_by: string;
  original_image: string;
  thumbnail: string;
  watermarked_image: string;
  camera_model?: string;
  aperture?: string;
  shutter_speed?: string;
  iso?: string;
  capture_time?: string;
  like_count: number;
  view_count: number;
  download_count: number;
  user_liked: boolean;
  user_favorited: boolean;
  privacy: 'PUBLIC' | 'PRIVATE';
  uploaded_at: string;
  tags: Tag[];
  user_tags?: User[];
}

export interface Comment {
  id: number;
  user: string;
  image: number;
  parent?: number;
  text: string;
  created_at: string;
  updated_at: string;
  replies: Comment[];
}