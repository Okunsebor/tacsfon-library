import { createClient } from '@supabase/supabase-js';

// Use your exact Supabase URL and your SERVICE_ROLE key (not the anon key) to bypass RLS.
const supabaseUrl = 'https://mjtzovexgxjpjcehnizd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qdHpvdmV4Z3hqcGpjZWhuaXpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDIzMDYxNywiZXhwIjoyMDc5ODA2NjE3fQ.BcIv34uZ_reSXTb_grMv1BGB_vI-B2mSelkgnTy_PrA';

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

            // Execute the update
            await supabase.from('books').update({ file_url: exactUrl }).eq('id', book.id);
            matchCount++;
            console.log(`[SYNCED] ${book.title} -> ${match.name}`);
        } else {
            console.log(`[ORPHANED - NO MATCH] ${book.title}`);
        }
    }

    console.log(`\nExecution complete. ${matchCount} database records permanently synced to active bucket files.`);
}

executeSync();