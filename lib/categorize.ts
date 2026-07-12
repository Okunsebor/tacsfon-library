import { Book } from '@/lib/types';

/**
 * Intelligent categorization logic to map books into clean genres based on
 * database category, author profile, and keywords.
 */
export const smartCategorize = (book: Book): string => {
  // 1. Force Database Cleanup (Merge duplicate religious terms)
  const dbCat = (book.category || "").toLowerCase();
  if (['religion', 'spiritual', 'christianity', 'faith', 'gospel'].includes(dbCat)) {
    return 'Spiritual Growth';
  }
  if (book.category && book.category !== 'General Collection' && book.category !== 'General') {
    return book.category;
  }
  
  const text = (book.title + " " + (book.summary || "")).toLowerCase();
  const author = (book.author || "").toLowerCase();

  // 2. Author Intelligence
  if (author.match(/hagin|oyedepo|adeboye|kumuyi|selman|watchman nee|spurgeon|copeland|prince|omartian|lewis|piper|lucado|kuhlman|hinn/i)) {
    return 'Spiritual Growth';
  }
  if (author.match(/maxwell|sinek|covey|carnegie|munroe/i)) {
    return (text.includes('prayer') || text.includes('spirit')) ? 'Spiritual Growth' : 'Leadership';
  }
  if (author.match(/kiyosaki|buffett|dangote|osuntokun|ramsey/i)) {
    return 'Finance & Career';
  }
  if (author.match(/chapman|vallotton/i)) {
    return 'Relationships';
  }

  // 3. Keyword Intelligence
  if (text.match(/leader|influence|laws|habit|strategy/i)) {
    return 'Leadership';
  }
  if (text.match(/prayer|god|spirit|jesus|faith|bible|gospel|church|devotional|holiness/i)) {
    return 'Spiritual Growth';
  }
  if (text.match(/money|finance|rich|wealth|business|economy|invest/i)) {
    return 'Finance & Career';
  }
  if (text.match(/physics|chem|math|calculus|program|code|python|engineer|biology|statistic|law/i)) {
    return 'Academic';
  }
  if (text.match(/love|marriage|dating|sex|courtship/i)) {
    return 'Relationships';
  }
  
  return 'General Collection';
};
