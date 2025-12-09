import { supabase } from '@/lib/supabaseClient';
import ReturnButton from '@/app/components/ReturnButton';

export const revalidate = 0; // Disable caching so you always see fresh data

export default async function AdminDashboard() {
  // Fetch all Active loans (and join with books table to get the title)
  const { data: loans, error } = await supabase
    .from('loans')
    .select('*, books(title, cover_url)')
    .eq('status', 'active')
    .order('borrowed_date', { ascending: false });

  if (error) console.error(error);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Librarian Dashboard</h1>
          <a href="/" className="text-blue-600 hover:underline">Go to Library Home &rarr;</a>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Active Loans ({loans?.length || 0})</h2>
            <p className="text-sm text-gray-500">These books are currently out with students.</p>
          </div>

          {(!loans || loans.length === 0) ? (
            <div className="p-10 text-center text-gray-500">No active loans. All books are in the library.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Borrowed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {/* @ts-ignore */}
                          {loan.books?.title || 'Unknown Book'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {loan.student_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(loan.borrowed_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ReturnButton loanId={loan.id} bookId={loan.book_id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}