import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase";

const getReviewsCollection = (apartmentId) =>
  collection(db, "apartments", apartmentId, "reviews");

const getRepliesCollection = (apartmentId, reviewId) =>
  collection(db, "apartments", apartmentId, "reviews", reviewId, "replies");

const normalizeReviewDoc = (docSnap, apartmentId) => {
  const reviewData = docSnap.data() ?? {};
  return {
    id: docSnap.id,
    apartmentId,
    ...reviewData,
    likedBy: reviewData.likedBy || [],
  };
};

const fetchLatestReply = async (apartmentId, reviewId) => {
  const repliesRef = getRepliesCollection(apartmentId, reviewId);
  const repliesQuery = query(
    repliesRef,
    orderBy("createdAt", "desc"),
    limit(1)
  );
  const repliesSnap = await getDocs(repliesQuery);
  if (repliesSnap.empty) return null;

  return {
    id: repliesSnap.docs[0].id,
    ...repliesSnap.docs[0].data(),
  };
};

const toDateValue = (raw) => {
  if (!raw) return new Date(0);
  if (typeof raw?.toDate === "function") return raw.toDate();
  if (raw instanceof Date) return raw;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

export const FirestoreReviewRepository = {
  subscribeApartmentReviews(apartmentId, { onNext, onError }) {
    const reviewsRef = getReviewsCollection(apartmentId);
    const q = query(reviewsRef, orderBy("createdAt", "desc"));

    return onSnapshot(
      q,
      async (snapshot) => {
        try {
          const data = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const review = normalizeReviewDoc(docSnap, apartmentId);
              if ((review.replyCount || 0) > 0) {
                review.latestReply = await fetchLatestReply(
                  apartmentId,
                  review.id
                );
              }
              return review;
            })
          );
          onNext(data);
        } catch (error) {
          onError?.(error);
        }
      },
      (error) => {
        onError?.(error);
      }
    );
  },

  async fetchHostReviews(apartmentIds = []) {
    const allReviews = [];

    for (const apartmentId of apartmentIds) {
      const reviewsRef = getReviewsCollection(apartmentId);
      const q = query(reviewsRef, orderBy("createdAt", "desc"));
      const querySnap = await getDocs(q);

      const apartmentReviews = querySnap.docs.map((docSnap) =>
        normalizeReviewDoc(docSnap, apartmentId)
      );
      allReviews.push(...apartmentReviews);
    }

    allReviews.sort((a, b) => {
      const dateA = toDateValue(a.createdAt);
      const dateB = toDateValue(b.createdAt);
      return dateB - dateA;
    });

    return allReviews;
  },
};
