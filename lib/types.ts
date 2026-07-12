export interface Book {
  id: number;
  title: string;
  author: string;
  cover_url: string | null;
  pdf_url: string | null;
  summary: string | null;
  category: string | null;
  available_copies: number;
  description?: string | null;
  is_approved: boolean;
  ebook_access: 'public' | 'private' | null;
  ia_id: string | null;
  created_at?: string;
}

export interface Loan {
  id: number;
  book_id: number;
  book_title: string;
  student_email: string;
  student_name: string;
  status: 'requested' | 'active' | 'returned' | 'rejected';
  request_date: string;
  due_date: string | null;
  return_date: string | null;     // Matches what is set in admin/loans/page.tsx
  returned_date: string | null;  // Matches what is set in ReturnButton.tsx
}

export interface Comment {
  id: number;
  book_id: number;
  user_name: string;
  content: string;
  created_at: string;
}

export interface LibraryEvent {
  id: number;
  title: string;
  event_date: string;
  image_url: string;
  audio_url: string | null;
}

export type ReadingTheme = 'light' | 'dark' | 'sepia';

export const SPEED_OPTIONS = [
  { label: '0.75×', value: 0.75 },
  { label: '1×', value: 1.0 },
  { label: '1.25×', value: 1.25 },
  { label: '1.5×', value: 1.5 },
  { label: '2×', value: 2.0 },
];
