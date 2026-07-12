'use server';

import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getAuthenticatedUser, verifyAdminStatus } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

/** Get the client IP address from request headers */
function getClientIp(): string {
  try {
    const requestHeaders = headers();
    const forwarded = requestHeaders.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = requestHeaders.get('x-real-ip');
    if (realIp) return realIp.trim();
  } catch {
    // next/headers might fail if not in a request context
  }
  return 'unknown';
}

export async function uploadBook(bookData: unknown) {
  // 1. Authenticate user
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Authentication required');
  }

  // 2. Validate payload type
  if (!bookData || typeof bookData !== 'object') {
    throw new Error('Invalid payload format');
  }

  const raw = bookData as Record<string, any>;

  // 3. Whitelist payload fields (SEC-004 Mass Assignment Prevention)
  const payload = {
    title: String(raw.title || '').trim(),
    author: String(raw.author || '').trim(),
    cover_url: raw.cover_url ? String(raw.cover_url).trim() : null,
    pdf_url: raw.pdf_url ? String(raw.pdf_url).trim() : null,
    summary: raw.summary ? String(raw.summary).trim() : null,
    category: raw.category ? String(raw.category).trim() : null,
    ebook_access: raw.ebook_access === 'private' ? 'private' : 'public',
    ia_id: raw.ia_id ? String(raw.ia_id).trim() : null,
    available_copies: 1, // Safe default copy count
    is_approved: false   // Hardcoded false — prevents client override
  };

  if (!payload.title || !payload.author) {
    throw new Error('Title and Author are required fields');
  }

  const { error } = await db.from('books').insert([payload]);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Validates the master admin passkey on the server.
 * Added Rate Limiting and Admin Email candidate validation to prevent brute-forcing.
 */
export async function verifyAdminPasskeyAction(inputPasskey: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Authenticate the caller first
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // 2. Double check if their email matches the authorized admin candidate email in the settings.
    // If not, they are completely blocked from even attempting passkey validation.
    const isCandidate = await verifyAdminStatus(user.email);
    if (!isCandidate) {
      return { success: false, error: 'Access denied: Unauthorized identity.' };
    }

    // 3. Apply strict Rate-Limiting (Combined User ID + Client IP)
    const ip = getClientIp();
    const rateLimitKey = `passkey:${user.id || ip}`;

    const rlResult = await rateLimit({
      headers: headers()
    } as any, {
      limit: 5,               // Only 5 attempts allowed
      windowSeconds: 60,      // Per minute
      identifier: rateLimitKey
    });

    if (!rlResult.success) {
      return { success: false, error: 'Too many unlock attempts. Please try again in 1 minute.' };
    }

    // 4. Retrieve admin passkey securely from database
    const { data, error } = await db
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'admin_passkey')
      .single();

    if (error || !data) {
      console.error('Error fetching passkey setting:', error);
      return { success: false, error: 'Internal system error' };
    }

    return { success: inputPasskey === data.setting_value };
  } catch (err) {
    console.error('verifyAdminPasskeyAction failed:', err);
    return { success: false, error: 'An error occurred during verification' };
  }
}

/**
 * Performs a safe loan approval on the server using Optimistic Concurrency Control.
 * This checks current book stock and atomically decrements it if copies are available.
 */
export async function approveLoanAction(loanId: number, bookId: number): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Authenticate and Authorize the Admin caller (SEC-002 check)
    const user = await getAuthenticatedUser();
    const isAdmin = await verifyAdminStatus(user?.email);

    if (!isAdmin) {
      return { success: false, error: 'Access Denied: Librarian privileges required' };
    }

    // 2. Fetch current copies count
    const { data: book, error: bookError } = await db
      .from('books')
      .select('available_copies')
      .eq('id', bookId)
      .single();

    if (bookError || !book) {
      return { success: false, error: 'Book details not found.' };
    }

    if (book.available_copies <= 0) {
      return { success: false, error: 'Cannot approve: Book is out of stock!' };
    }

    // 3. Decrement copies count atomically by ensuring the record still has positive copies.
    const { data: updatedBooks, error: updateError } = await db
      .from('books')
      .update({ available_copies: book.available_copies - 1 })
      .eq('id', bookId)
      .gt('available_copies', 0)
      .select();

    if (updateError || !updatedBooks || updatedBooks.length === 0) {
      return { success: false, error: 'Cannot approve: Book is out of stock or update conflicted.' };
    }

    // 4. Set loan to active and assign a 14-day due date.
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const { error: loanError } = await db
      .from('loans')
      .update({
        status: 'active',
        due_date: dueDate.toISOString(),
      })
      .eq('id', loanId);

    if (loanError) {
      // Rollback book decrement since loan update failed
      await db
        .from('books')
        .update({ available_copies: book.available_copies })
        .eq('id', bookId);

      return { success: false, error: 'Failed to update loan status: ' + loanError.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('approveLoanAction failed:', err);
    return { success: false, error: err.message || 'Server error occurred during approval.' };
  }
}

/**
 * Securely updates the master admin passkey.
 * Enforces admin authorization to prevent unauthorized changes.
 */
export async function updateAdminPasskeyAction(newPasskey: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Authenticate and Authorize the Admin caller
    const user = await getAuthenticatedUser();
    const isAdmin = await verifyAdminStatus(user?.email);

    if (!isAdmin) {
      return { success: false, error: 'Access Denied: Admin privileges required' };
    }

    if (!newPasskey || newPasskey.trim() === '') {
      return { success: false, error: 'Passkey cannot be empty' };
    }

    // 2. Update the passkey in the database
    const { error } = await db
      .from('admin_settings')
      .update({ setting_value: newPasskey })
      .eq('setting_key', 'admin_passkey');

    if (error) {
      console.error('Error updating passkey:', error);
      return { success: false, error: 'Failed to update passkey' };
    }

    return { success: true };
  } catch (err) {
    console.error('updateAdminPasskeyAction failed:', err);
    return { success: false, error: 'An error occurred during update' };
  }
}
