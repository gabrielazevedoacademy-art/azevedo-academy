export type Role = 'user' | 'admin';

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  whatsapp: string | null;
  role: Role;
  created_at: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_url: string | null;
  is_free: boolean;
  price_cents: number | null;
  checkout_url: string | null;
  kiwify_product_id: string | null;
  status: 'draft' | 'published';
  position: number;
  created_at: string;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  position: number;
};

export type Lesson = {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  summary: string | null;
  duration_minutes: number | null;
  is_preview: boolean;
  position: number;
};

export type Material = {
  id: string;
  course_id: string | null;
  lesson_id: string | null;
  title: string;
  description: string | null;
  kind: 'file' | 'link';
  url: string | null;
  storage_path: string | null;
  is_published: boolean;
  position: number;
};

export type ModuleWithLessons = Module & { lessons: Lesson[] };
