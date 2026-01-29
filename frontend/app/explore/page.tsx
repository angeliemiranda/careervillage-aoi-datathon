'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { recommendationAPI, swipeAPI, Recommendation } from '@/lib/api';
import { storage } from '@/lib/storage';
import JobCard from '@/components/JobCard';

export default function ExplorePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(storage.getSessionId() || storage.generateSessionId());
  const [swipeCount, setSwipeCount] = useState(0);

  useEffect(() => {
    const id = storage.getUserId();
    if (!id) {
      router.push('/onboarding');
      return;
    }
    setUserId(id);
    fetchRecommendations(id);
  }, [router]);

  const fetchRecommendations = async (userId: number) => {
    try {
      const recs = await recommendationAPI.get(userId, 20);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right', aspect: string = 'overall') => {
    if (!userId || currentIndex >= recommendations.length) return;

    const currentRec = recommendations[currentIndex];
    
    try {
      await swipeAPI.create({
        user_id: userId,
        job_listing_id: currentRec.job.id,
        interaction_type: direction === 'left' ? 'swipe_left' : 'swipe_right',
        swipe_direction: direction,
        position_in_deck: currentIndex,
        session_id: sessionId,
        aspect_swiped: aspect,
      });

      const newSwipeCount = swipeCount + 1;
      setSwipeCount(newSwipeCount);

      // Move to next job
      setCurrentIndex(currentIndex + 1);

      // Load more recommendations if running low
      if (currentIndex + 1 >= recommendations.length - 3 && userId) {
        fetchRecommendations(userId);
      }

      // Show message every 3 swipes
      if (newSwipeCount % 3 === 0) {
        // You could show a toast notification here
        console.log('Preferences updated!');
      }
    } catch (error) {
      console.error('Error recording swipe:', error);
    }
  };

  const currentRecommendation = recommendations[currentIndex];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Explore Jobs</h1>
          <p className="text-sm text-gray-600 mt-1">Swipe right to like, left to pass</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex border-t border-gray-200">
          <button
            onClick={() => router.push('/results')}
            className="flex-1 py-3 text-center font-medium text-gray-600 hover:text-gray-900"
          >
            All Jobs
          </button>
          <button
            onClick={() => router.push('/explore')}
            className="flex-1 py-3 text-center font-medium text-purple-600 border-b-2 border-purple-600"
          >
            Explore
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : currentRecommendation ? (
          <>
            {/* Progress */}
            <div className="w-full max-w-sm mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentIndex + 1} of {recommendations.length}</span>
                <span>{swipeCount} swipes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-purple-600 h-1 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / recommendations.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Job Card */}
            <JobCard
              recommendation={currentRecommendation}
              onSwipe={handleSwipe}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All done!</h2>
            <p className="text-gray-600 mb-6">You've seen all available jobs</p>
            <button
              onClick={() => router.push('/results')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              View All Results
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {currentRecommendation && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-2xl mb-1">👈</div>
              <p className="text-xs text-gray-600">Swipe left<br />to pass</p>
            </div>
            <div>
              <div className="text-2xl mb-1">👉</div>
              <p className="text-xs text-gray-600">Swipe right<br />to like</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
