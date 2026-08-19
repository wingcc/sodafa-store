// SODFA MARKETPLACE - Reviews Management Page

import React, { useState } from 'react';
import {
  Star,
  Check,
  X,
  MessageSquare,
  Search,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
} from 'lucide-react';
import Badge from '../components/ui/Badge';
import RefreshButton from '../components/ui/RefreshButton';
import { reviews } from '../data/mockData';
import { useToast } from '@/lib/toast';

const Reviews: React.FC = () => {
  const { addToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = () => {
    addToast('info', 'Reviews list refreshed', { title: 'Refreshed' });
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">Manage customer reviews and ratings</p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          size="md"
          variant="default"
        />
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
          <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                className={star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">{reviews.length} reviews</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {review.customerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{review.customerName}</p>
                    <Badge
                      variant={review.status === 'approved' ? 'success' : review.status === 'pending' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">on {review.productName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                      />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              {review.status === 'pending' && (
                <>
                  <button
                    onClick={() => addToast('success', `Review by ${review.customerName} is now visible.`, { title: 'Review Approved' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                  >
                    <Check size={12} /> Approve
                  </button>
                  <button
                    onClick={() => addToast('warning', `Review by ${review.customerName} has been hidden.`, { title: 'Review Rejected' })}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                  >
                    <X size={12} /> Reject
                  </button>
                </>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                <MessageSquare size={12} /> Reply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
