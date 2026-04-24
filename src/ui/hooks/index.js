// Analytics Hooks
export { useAnalyticsData } from './analytics/useAnalyticsData';
export { useAnalyticsSuggestions } from './analytics/useAnalyticsSuggestions';
export { useAnalyticsNavigation } from './analytics/useAnalyticsNavigation';
export { useApartmentAnalytics } from './analytics/useApartmentAnalytics';

// Auth Hooks
export { default as useEnsureUserDoc } from './auth/useEnsureUserDoc'; // Internamente esporta useInitUserDoc
export { default as useFirebaseBridgeAuth } from './auth/useFirebaseBridgeAuth';

// Chat Hooks
export { useChat } from './chat/useChat';
export { useChatSelection } from './chat/useChatSelection';
export { useChatBootstrapFromUrl } from './chat/useChatBootstrapFromUrl';
export { useChatUI } from './chat/useChatUI';
export { useConversationDeletion } from './chat/useConversationDeletion';
export { useNotifications } from './chat/useNotifications';
export { usePresence } from './chat/usePresence';

// Favorites Hooks
export { default as useFavoritesPage } from './favorites/useFavoritesPage';
export { useReceivedLikes } from './likes/useReceivedLikes';

// Apartment Hooks
export { useApartment } from './apartment/useApartment';
export { useApartmentOwner } from './apartment/useApartmentOwner';
export { useApartmentLiked } from './apartment/useApartmentLiked';
export { useTrackApartmentView } from './apartment/useTrackApartmentView';
export { useApartmentsFilters } from './apartments/useApartmentsFilters';
export { useApartmentsPage } from './apartments/useApartmentsPage';
export { useDetailedCardPreference } from './apartments/useDetailedCardPreference';

// Fetch Hooks
export {
  default as fetchUserData,
  fetchPublicUserData,
  fetchPrivateUserData,
} from './fetches/fetchUserData';
export { useCitiesByLetter } from './fetches/useCitiesByLetter';
export { useCities, useCityBySlug } from './fetches/useCities';
export { useCityLogic } from './fetches/useCityDropdownLogic';
export { default as useFetchApartment } from './fetches/useFetchApartment';
export { useFetchApartmentRooms } from './fetches/useFetchApartmentRooms';
export { useFetchApartmentOccupants } from './fetches/useFetchApartmentOccupants';
export { useFetchAppartamenti } from './fetches/useFetchAppartamenti';
export { default as useFavoriteApartments } from './fetches/useFetchFavoriteApartments';
export { default as useFetchFavoriteApartments } from './fetches/useFetchFavoriteApartments'; // Alias per compatibilità
export { useFetchRecensioni } from './fetches/useFetchRecensioni';
export { useHostReviews } from './fetches/useHostReviews';
export { useFetchUncheckedAnnunci } from './fetches/useFetchUncheckedAnnunci';
export { useFetchSegnalazioni } from './fetches/useFetchSegnalazioni';
export { default as useToggleLike } from './fetches/useToggleLike';

// Formatter Hooks
export { default as useBookingMessage } from './formatters/useBookingMessage';

// Form Hooks
export { useContactForm } from './forms/useContactForm';
export { useFormProgress } from './forms/useFormProgress';
export { useFormNavigation } from './forms/useFormNavigation';
export { default as usePubblicaAnnuncioEnhanced } from './forms/usePubblicaAnnuncioEnhanced';
export { default as usePubblicaAnnuncioForm } from './forms/usePubblicaAnnuncioForm';
export { useFormValidation, validators } from './forms/useFormValidation';

// Interactive Hooks
export { default as useClickOutside } from './interactives/useClickOutside';
export { default as useInView } from './interactives/useInView';
export { default as useDeferredInView } from './interactives/useDeferredInView';
export { default as useNavigateToCity } from './interactives/useNavigateToCity';
export { default as useTouchSwipe } from './interactives/useTouchSwipe';
export { useScroll } from './interactives/useScroll';

// Reviews Hooks
export { useReviewActions } from './reviews/useReviewActions';

// SEO Hooks
export { default as useRouteMetadata } from './seo/useRouteMetadata';

// Share Hooks
export { default as useSocialLinks } from './share/useSocialLinks';

// UI Hooks
export { useScrollProgress } from './ui/useScrollProgress';
export { CookieConsentProvider, useCookieConsent } from './ui/useCookieConsent';
export { ThemeProvider, useTheme } from './ui/useTheme';
export { default as useWindowWidth } from './ui/useWindowWidth';
export { usePaginationSlice } from './ui/usePaginationSlice';

// User Hooks
export { default as useCityClickTracker } from './users/useCityClickTracker';
export { useIsAdmin } from './users/useIsAdmin';
export { useIsVerifiedHost } from './users/useIsVerifiedHost';
export { default as useSuggestedCities } from './users/useSuggestedCities';
