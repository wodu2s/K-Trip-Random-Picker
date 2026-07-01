export const REVIEW_KEYWORDS = [
  '조용해요',
  '사진 찍기 좋아요',
  '로컬 감성이 있어요',
  '걷기 좋아요',
  '사람이 많지 않아요',
  '대중교통이 편해요',
] as const;

export type ReviewKeyword = (typeof REVIEW_KEYWORDS)[number];

const STORAGE_KEY = 'k_trip_keyword_reviews';
const USER_VOTES_KEY = 'k_trip_my_keyword_votes';

export interface KeywordReviewEntry {
  destinationId: string;
  keyword: ReviewKeyword;
  addedAt: string;
}

function voteKey(destinationId: string, keyword: ReviewKeyword): string {
  return `${destinationId}:${keyword}`;
}

function readAll(): KeywordReviewEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(entries: KeywordReviewEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function readUserVotes(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(USER_VOTES_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeUserVotes(votes: Record<string, boolean>): void {
  localStorage.setItem(USER_VOTES_KEY, JSON.stringify(votes));
}

export function isKeywordSelected(
  destinationId: string,
  keyword: ReviewKeyword,
): boolean {
  return readUserVotes()[voteKey(destinationId, keyword)] === true;
}

export function getSelectedKeywords(destinationId: string): ReviewKeyword[] {
  const votes = readUserVotes();
  return REVIEW_KEYWORDS.filter((kw) => votes[voteKey(destinationId, kw)] === true);
}

export function getKeywordCounts(
  destinationId: string,
): { keyword: ReviewKeyword; count: number }[] {
  const counts = new Map<ReviewKeyword, number>();
  readAll()
    .filter((e) => e.destinationId === destinationId)
    .forEach((e) => counts.set(e.keyword, (counts.get(e.keyword) ?? 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([keyword, count]) => ({ keyword, count }));
}

export function toggleKeywordReview(
  destinationId: string,
  keyword: ReviewKeyword,
): boolean {
  const votes = readUserVotes();
  const key = voteKey(destinationId, keyword);
  const entries = readAll();

  if (votes[key]) {
    delete votes[key];
    writeUserVotes(votes);
    const idx = entries.findIndex(
      (e) => e.destinationId === destinationId && e.keyword === keyword,
    );
    if (idx >= 0) {
      entries.splice(idx, 1);
      writeAll(entries);
    }
    return false;
  }

  votes[key] = true;
  writeUserVotes(votes);
  entries.push({
    destinationId,
    keyword,
    addedAt: new Date().toISOString(),
  });
  writeAll(entries);
  return true;
}

/** @deprecated toggleKeywordReview 사용 */
export function addKeywordReview(destinationId: string, keyword: ReviewKeyword): void {
  if (!isKeywordSelected(destinationId, keyword)) {
    toggleKeywordReview(destinationId, keyword);
  }
}

/** @deprecated isKeywordSelected 사용 */
export function hasUserSubmittedKeyword(
  destinationId: string,
  keyword: ReviewKeyword,
): boolean {
  return isKeywordSelected(destinationId, keyword);
}

/** @deprecated 더 이상 사용하지 않음 */
export function markKeywordSubmitted(
  _destinationId: string,
  _keyword: ReviewKeyword,
): void {
  /* no-op */
}

export function getKeywordReviews(destinationId: string): ReviewKeyword[] {
  return getKeywordCounts(destinationId).map((c) => c.keyword);
}
