import React, { useState, useEffect } from 'react';
import { Award, Loader2 } from 'lucide-react';
import api from '../services/api';

const Performance = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/performance-reviews');
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching performance reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-crewix-accent" size={32}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Performance</h2>
          <p className="text-gray-500 text-sm mt-1">Track goals and review feedback.</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-sm border border-white">
        <h3 className="font-bold text-gray-800 mb-4">Recent Reviews</h3>
        <div className="space-y-4">
            {reviews.map(review => {
                const reviewerName = review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'System';
                return (
                <div key={review.id} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-50 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Award size={18} />
                  </div>
                  <div>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-gray-800 text-sm">Review ({review.reviewDate})</h4>
                        <span className="bg-crewix-light text-crewix-dark text-xs px-2 py-0.5 rounded-md font-bold">
                            Score: {review.score}/5
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-2">Reviewed by: {reviewerName}</p>
                      <p className="text-sm text-gray-600">{review.feedback}</p>
                  </div>
                </div>
            )})}
            {reviews.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No actively completed work or reviews found.</p>
            )}
        </div>
      </div>
    </div>
  );
};
export default Performance;
