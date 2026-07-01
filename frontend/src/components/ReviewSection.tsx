import React, { useState, useEffect, useCallback } from 'react';
import { Review } from '../types/ui';
import { Star, MessageCircle, Send, User, Calendar, Tags } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  REVIEW_KEYWORDS,
  ReviewKeyword,
  toggleKeywordReview,
  getKeywordCounts,
  isKeywordSelected,
} from '../utils/keywordReviews';

interface ReviewSectionProps {
  destinationId: string;
}

export default function ReviewSection({ destinationId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [keywordCounts, setKeywordCounts] = useState<{ keyword: ReviewKeyword; count: number }[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<ReviewKeyword[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newReview, setNewReview] = useState({
    nickname: '',
    rating: 5,
    content: '',
  });

  const refreshKeywords = useCallback(() => {
    setKeywordCounts(getKeywordCounts(destinationId));
    setSelectedKeywords(
      REVIEW_KEYWORDS.filter((kw) => isKeywordSelected(destinationId, kw)),
    );
  }, [destinationId]);

  useEffect(() => {
    const savedReviews = JSON.parse(localStorage.getItem('trip_reviews') || '[]');
    setReviews(savedReviews.filter((r: Review) => r.destinationId === destinationId));
    refreshKeywords();
  }, [destinationId, refreshKeywords]);

  const handleKeywordClick = (keyword: ReviewKeyword) => {
    toggleKeywordReview(destinationId, keyword);
    refreshKeywords();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.nickname || !newReview.content) return;

    const review: Review = {
      id: Date.now().toString(),
      destinationId,
      nickname: newReview.nickname,
      rating: newReview.rating,
      content: newReview.content,
      date: new Date().toLocaleDateString('ko-KR'),
    };

    const savedReviews = JSON.parse(localStorage.getItem('trip_reviews') || '[]');
    const updatedReviews = [review, ...savedReviews];
    localStorage.setItem('trip_reviews', JSON.stringify(updatedReviews));

    setReviews([review, ...reviews]);
    setShowModal(false);
    setNewReview({ nickname: '', rating: 5, content: '' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-sky-50/60 border-2 border-sky-100 rounded-[2rem] p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Tags className="text-sky-500" size={20} />
            방문자 키워드
          </h3>
          <p className="text-sm text-slate-500">
            방문 후 느낀 점을 키워드로 남겨주세요. 여러 개를 골라도 돼요.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {REVIEW_KEYWORDS.map((keyword) => {
            const selected = selectedKeywords.includes(keyword);
            return (
              <button
                key={keyword}
                type="button"
                onClick={() => handleKeywordClick(keyword)}
                aria-pressed={selected}
                className={`px-3 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                  selected
                    ? 'bg-sky-500 border-sky-400 text-white shadow-md'
                    : 'bg-white border-sky-100 text-sky-700 hover:border-sky-300'
                }`}
              >
                {selected ? '✓ ' : ''}
                {keyword}
              </button>
            );
          })}
        </div>

        {keywordCounts.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {keywordCounts.map(({ keyword, count }) => (
              <span
                key={keyword}
                className="text-[0.65rem] font-bold px-2.5 py-1 rounded-full bg-white border border-sky-100 text-slate-600"
              >
                {keyword} {count}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 border-t border-sky-100 pt-3 mt-1">아직 선택된 키워드가 없어요. 첫 키워드를 남겨보세요!</p>
        )}
        {keywordCounts.length > 0 && (
          <div className="pt-3 mt-1 border-t border-sky-100">
            <p className="text-xs text-slate-500 font-medium">
              이 여행지는 <span className="font-bold text-sky-600">{keywordCounts.map(k => k.keyword).join(', ')}</span> 키워드가 선택되었습니다.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle className="text-sky-500" />
            다녀온 사람들의 이야기
          </h3>
          <p className="text-sm text-slate-500">{reviews.length}개의 후기가 있습니다.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-secondary h-[42px] px-5 rounded-full text-sm"
        >
          후기 작성하기
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center space-y-4 border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-300 shadow-sm">
            <MessageCircle size={32} />
          </div>
          <p className="text-slate-500 font-bold tracking-tight text-sm">
            아직 이 여행지의 방문 기록이 없어요.<br />
            첫 방문 후기를 남기면 다음 여행자에게 도움이 됩니다.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ui-card p-6 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-none mb-1">{review.nickname}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < review.rating ? 'currentColor' : 'none'} strokeWidth={3} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-full">
                  <Calendar size={10} />
                  {review.date}
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{review.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border-4 border-white overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">어떠셨나요?</h3>
                  <p className="text-slate-400 text-sm font-medium">당신의 경험을 나누어주세요!</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">닉네임</label>
                    <input
                      type="text"
                      value={newReview.nickname}
                      onChange={(e) => setNewReview({ ...newReview, nickname: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-sky-100 focus:bg-white outline-none transition-all font-bold text-slate-700"
                      placeholder="이름을 입력해주세요"
                    />
                  </div>

                  <div className="space-y-2 text-center">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">평점</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: val })}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            newReview.rating >= val ? 'bg-yellow-100 text-yellow-500 scale-110' : 'bg-slate-50 text-slate-300'
                          }`}
                        >
                          <Star fill={newReview.rating >= val ? 'currentColor' : 'none'} size={24} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">내용</label>
                    <textarea
                      rows={4}
                      value={newReview.content}
                      onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-2 border-slate-50 focus:border-sky-100 focus:bg-white outline-none transition-all font-medium text-slate-600 resize-none"
                      placeholder="여행의 기억을 기록해보세요..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full h-[52px] rounded-[14px] text-base"
                >
                  리뷰 등록하기
                  <Send size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
