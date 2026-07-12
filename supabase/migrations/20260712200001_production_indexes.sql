-- ============================================================
-- Migration: Production Indexes for High-Traffic Queries
-- ============================================================
-- Safe to run multiple times (IF NOT EXISTS guards).

-- ─── Books Table ─────────────────────────────────────────────

-- Partial index: only approved books (the common query path)
-- Eliminates the full table scan on every catalog load
CREATE INDEX IF NOT EXISTS idx_books_approved_only
  ON books(id)
  WHERE is_approved = true;

-- Category filter index (used by /api/v1/books?category=)
CREATE INDEX IF NOT EXISTS idx_books_category
  ON books(category)
  WHERE is_approved = true;

-- Recency index (for "newest books" queries using ID descending)
CREATE INDEX IF NOT EXISTS idx_books_id_desc
  ON books(id DESC)
  WHERE is_approved = true;

-- ─── Loans Table ─────────────────────────────────────────────

-- Status filter (admin loan management dashboard)
-- Most queries filter by status ('requested', 'active', etc.)
CREATE INDEX IF NOT EXISTS idx_loans_status
  ON loans(status);

-- Student lookup (student viewing their own loan history)
CREATE INDEX IF NOT EXISTS idx_loans_student_email
  ON loans(student_email);

-- Book lookup (checking copies in flight for a specific book)
CREATE INDEX IF NOT EXISTS idx_loans_book_id
  ON loans(book_id);

-- Composite: student + status (most loan status check queries)
CREATE INDEX IF NOT EXISTS idx_loans_email_status
  ON loans(student_email, status);

-- Composite: book + status (approve loan checks for stock)
CREATE INDEX IF NOT EXISTS idx_loans_book_status
  ON loans(book_id, status);

-- ─── reading_progress Table ──────────────────────────────────

-- Create the reading progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS reading_progress (
  id          bigserial       PRIMARY KEY,
  user_email  text            NOT NULL,
  book_id     bigint          NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  paragraph_index integer     NOT NULL DEFAULT 0,
  scroll_position integer     NOT NULL DEFAULT 0,
  updated_at  timestamptz     NOT NULL DEFAULT now(),
  CONSTRAINT uq_reading_progress UNIQUE(user_email, book_id)
);

-- Fast lookup for restoring a reader's position
CREATE INDEX IF NOT EXISTS idx_reading_progress_lookup
  ON reading_progress(user_email, book_id);
