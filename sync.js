import { createClient } from '@supabase/supabase-js';

// Use your exact Supabase URL and your SERVICE_ROLE key (not the anon key) to bypass RLS.
// Assumes this script is run with node --env-file=.env.local sync.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in environment.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSync() {
    console.log('Fetching absolute truth from storage bucket...');
    const { data: files, error: storageError } = await supabase.storage.from('books').list('', {
        limit: 500,
        offset: 0,
    });

    if (storageError) {
        console.error('Bucket fetch failed:', storageError);
        return;
    }

    console.log('Fetching database rows...');
    const { data: books, error: dbError } = await supabase.from('books').select('id, title');

    if (dbError) {
        console.error('Database fetch failed:', dbError);
        return;
    }

    let matchCount = 0;

    for (const book of books) {
        // Strip absolutely everything except raw letters and numbers
        const rawTitle = book.title.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Search the bucket list for a file that contains this raw title
        const match = files.find(file => {
            const rawFileName = file.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            // Check if the file contains the title, or the title contains the file (ignoring '.pdf')
            return rawFileName.includes(rawTitle) || rawTitle.includes(rawFileName.replace('pdf', ''));
        });

        if (match) {
            const exactUrl = `${supabaseUrl}/storage/v1/object/public/books/${match.name}`;

            // Execute the update on the correct column: pdf_url
            const { error: updateError } = await supabase.from('books').update({ pdf_url: exactUrl }).eq('id', book.id);
            
            if (updateError) {
                console.error(`[ERROR SYNCING] ${book.title}:`, updateError.message);
            } else {
                matchCount++;
                console.log(`[SYNCED] ${book.title} -> ${match.name}`);
            }
        } else {
            console.log(`[ORPHANED - NO MATCH] ${book.title}`);
        }
    }

    console.log(`\nExecution complete. ${matchCount} database records permanently synced to active bucket files.`);
}

executeSync();