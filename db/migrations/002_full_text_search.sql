-- ============================================================
-- Migration 002: Full-Text Search with PostgreSQL tsvector
-- ============================================================
-- Adds a tsvector column to books for fast, ranked full-text search.
-- This replaces the current client-side .filter() approach which
-- downloads all books and filters in the browser.
--
-- After this migration, the search endpoint will use:
--   WHERE search_vector @@ to_tsquery('english', 'query')
-- which uses the GIN index and runs in milliseconds.

-- Step 1: Add the search vector column
ALTER TABLE books ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Step 2: Create the GIN index (fast for @@ operator)
CREATE INDEX IF NOT EXISTS idx_books_search_fts
  ON books USING gin(search_vector);

-- Step 3: Create the trigger function that auto-populates the vector
CREATE OR REPLACE FUNCTION books_search_update_trigger()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
                       setweight(to_tsvector('english', COALESCE(NEW.author, '')), 'B') ||
                       setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Attach the trigger to the books table
DROP TRIGGER IF EXISTS books_search_update ON books;
CREATE TRIGGER books_search_update
  BEFORE INSERT OR UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION books_search_update_trigger();

-- Step 5: Backfill the search_vector for all existing books
UPDATE books SET
  search_vector = setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
                  setweight(to_tsvector('english', COALESCE(author, '')), 'B') ||
                  setweight(to_tsvector('english', COALESCE(summary, '')), 'C')
WHERE search_vector IS NULL;

-- ─── Usage Example ───────────────────────────────────────────
-- After this migration, you can use ranked full-text search:
--
-- SELECT id, title, author,
--        ts_rank(search_vector, query) AS rank
-- FROM books, to_tsquery('english', 'mathematics & algebra') query
-- WHERE search_vector @@ query
--   AND is_approved = true
-- ORDER BY rank DESC;
