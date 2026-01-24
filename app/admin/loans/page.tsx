'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import AdminGatekeeper from '@/app/components/AdminGatekeeper';
import { CheckCircle, XCircle, Clock, RotateCcw, Search, User, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoanManager() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('requested'); // 'requested', 'active', 'returned'

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  async function fetchLoans() {
    setLoading(true);
    let query = supabase
      .from('loans')
      .select('*, books(available_copies)') // We fetch book stock too
      .order('request_date', { ascending: false });

    if (filter !== 'all') {
        query = query.eq('status', filter);
    }

    const { data } = await query;
    setLoans(data || []);
    setLoading(false);
  }

  // --- ACTIONS ---

  // 1. APPROVE REQUEST (Give book to student)
  const handleApprove = async (loan: any) => {
    if (!confirm(`Approve loan for "${loan.book_title}"?`)) return;

    // A. Check if stock exists
    const { data: book } = await supabase.from('books').select('available_copies').eq('id', loan.book_id).single();
    
    if (!book || book.available_copies < 1) {
        return alert("Error: No copies left in stock!");
    }

    // B. Deduct Stock
    await supabase.from('books').update({ available_copies: book.available_copies - 1 }).eq('id', loan.book_id);

    // C. Set Loan to Active & Set Due Date (e.g., 14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks

    const { error } = await supabase.from('loans').update({
        status: 'active',
        due_date: dueDate.toISOString()
    }).eq('id', loan.id);

    if (error) alert("Error: " + error.message);
    else fetchLoans();
  };

  // 2. RETURN BOOK (Student brings it back)
  const handleReturn = async (loan: any) => {
    if (!confirm(`Mark "${loan.book_title}" as returned?`)) return;

    // A. Add Stock Back
    // We need current stock first
    const { data: book } = await supabase.from('books').select('available_copies').eq('id', loan.book_id).single();
    
    if (book) {
       await supabase.from('books').update({ available_copies: book.available_copies + 1 }).eq('id', loan.book_id);
    }

    // B. Mark Loan as Returned
    await supabase.from('loans').update({
        status: 'returned',
        return_date: new Date().toISOString()
    }).eq('id', loan.id);

    fetchLoans();
  };

  // 3. REJECT REQUEST
  const handleReject = async (id: number) => {
    if (!confirm("Reject this request?")) return;
    await supabase.from('loans').update({ status: 'rejected' }).eq('id', id);
    fetchLoans();
  };

  return (
    <AdminGatekeeper>
      <div className="min-h-screen bg-gray-50 p-6 md:p-12 pt-24">
        <div className="max-w-6xl mx-auto">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="p-2 bg-white rounded-full hover:bg-gray-100 shadow-sm"><ArrowLeft size={20}/></Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Loan Manager</h1>
                        <p className="text-gray-500">Track physical book lending and returns.</p>
                    </div>
                </div>

                {/* FILTER TABS */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {['requested', 'active', 'returned'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                                filter === f ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* LOAN TABLE */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="p-6">Student</th>
                            <th className="p-6">Book Title</th>
                            <th className="p-6">Timeline</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={4} className="p-10 text-center text-gray-400">Loading...</td></tr>
                        ) : loans.length === 0 ? (
                            <tr><td colSpan={4} className="p-10 text-center text-gray-400">No {filter} loans found.</td></tr>
                        ) : (
                            loans.map(loan => (
                                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                                <User size={18}/>
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800 text-sm">{loan.student_name || "Student"}</div>
                                                <div className="text-xs text-gray-500">{loan.student_email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={16} className="text-gray-400"/>
                                            <span className="font-medium text-gray-700">{loan.book_title}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs space-y-1">
                                            <div className="text-gray-500">Requested: <strong>{new Date(loan.request_date).toLocaleDateString()}</strong></div>
                                            {loan.due_date && <div className="text-orange-600">Due: <strong>{new Date(loan.due_date).toLocaleDateString()}</strong></div>}
                                            {loan.return_date && <div className="text-green-600">Returned: <strong>{new Date(loan.return_date).toLocaleDateString()}</strong></div>}
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        
                                        {/* ACTION BUTTONS */}
                                        {loan.status === 'requested' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleApprove(loan)} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors flex items-center gap-2">
                                                    <CheckCircle size={14}/> Approve
                                                </button>
                                                <button onClick={() => handleReject(loan.id)} className="bg-red-50 text-red-500 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                                                    Reject
                                                </button>
                                            </div>
                                        )}

                                        {loan.status === 'active' && (
                                            <button onClick={() => handleReturn(loan)} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-200 transition-colors flex items-center gap-2 ml-auto">
                                                <RotateCcw size={14}/> Mark Returned
                                            </button>
                                        )}

                                        {loan.status === 'returned' && (
                                            <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs bg-green-50 px-3 py-1 rounded-full">
                                                <CheckCircle size={12}/> Completed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </AdminGatekeeper>
  );
}