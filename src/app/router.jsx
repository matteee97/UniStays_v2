import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "@/ui/components/common/clerk/ProtectedRoute.jsx";
import AdminRoute from "@/ui/components/common/clerk/AdminRoute.jsx";
import LoadingIcon from "@/ui/components/common/shared/icons/LoadingIcon.jsx";
import { ROUTES } from "@/app/routes";

const LazyApartments = lazy(() => import("@/ui/pages/Apartments.jsx"));
const LazyApartment = lazy(() => import("@/ui/pages/Apartment.jsx"));
const LazyApp = lazy(() => import("@/ui/pages/App.jsx"));
const LazySignInPage = lazy(() => import("@/ui/pages/SignIn.jsx"));
const LazySignUpPage = lazy(() => import("@/ui/pages/SignUp.jsx"));
const LazyNotFound = lazy(() => import("@/ui/pages/NotFoundPage.jsx"));
const LazyTuoiAnnunci = lazy(() => import("@/ui/pages/I_TuoiAnnunci.jsx"));
const LazyDettagliTecnici = lazy(
  () => import("@/ui/pages/DettagliTecnici.jsx"),
);
const LazyPubblicaAnnuncio = lazy(
  () => import("@/ui/pages/PubblicaAnnuncio.jsx"),
);
const LazyPrePubblicaAnnuncio = lazy(
  () => import("@/ui/pages/PrePubblicaAnnuncio.jsx"),
);
const LazyAnnunciGrid = lazy(
  () => import("@/ui/components/sections/I_TuoiAnnunciSection/AnnunciGrid.jsx"),
);
const LazyContactPage = lazy(() => import("@/ui/pages/ContactPage.jsx"));
const LazyFavoritesPage = lazy(() => import("@/ui/pages/FavoritesPage.jsx"));
const LazyChatPage = lazy(() => import("@/ui/pages/ChatPage.jsx"));
const LazyPrivacyPolicyPage = lazy(
  () => import("@/ui/pages/PrivacyPolicy.jsx"),
);
const LazyCookiePolicyPage = lazy(() => import("@/ui/pages/CookiePolicy.jsx"));
const LazyTermsAndConditionsPage = lazy(
  () => import("@/ui/pages/TermsAndConditions.jsx"),
);

import MainLayout from "@/ui/components/layouts/MainLayout.jsx";
import AuthLayout from "@/ui/components/layouts/AuthLayout.jsx";
const LazyHostApartmentsPage = lazy(
  () => import("@/ui/pages/HostApartmentsPage.jsx"),
);
const LazyDebugPage = lazy(() => import("@/ui/pages/DebugPage.jsx"));
const LazyAdminPanel = lazy(() => import("@/ui/pages/AdminPanel.jsx"));
export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyApp />
          </Suspense>
        ),
      },
      {
        path: ROUTES.ABOUT,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyApp />
          </Suspense>
        ),
      },
      {
        path: "contatti/:reason",
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyContactPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.CONTACT,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyContactPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.PRIVACY,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyPrivacyPolicyPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.COOKIE_POLICY,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyCookiePolicyPage />
          </Suspense>
        ),
      },
      {
        path: "/cookie",
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyCookiePolicyPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.TERMS,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyTermsAndConditionsPage />
          </Suspense>
        ),
      },
      {
        path: "/terms",
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyTermsAndConditionsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.FAVORITES,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <ProtectedRoute>
              <LazyFavoritesPage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: ROUTES.PRE_PUBLISH_ANNOUNCEMENT,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyPrePubblicaAnnuncio />
          </Suspense>
        ),
      },
      {
        path: ROUTES.HOST_APARTMENTS,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyHostApartmentsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.APARTMENTS,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyApartments />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: ROUTES.APARTMENT_DETAIL,
    element: <MainLayout showNavbar={false} />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazyApartment />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: ROUTES.CHAT,
    element: (
      <Suspense fallback={<LoadingIcon />}>
        <ProtectedRoute>
          <LazyChatPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: ROUTES.PUBLISH_ANNOUNCEMENT,
    element: (
      <Suspense fallback={<LoadingIcon />}>
        <ProtectedRoute>
          <LazyPubblicaAnnuncio />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: ROUTES.MY_ANNOUNCEMENTS,
    element: (
      <Suspense fallback={<LoadingIcon />}>
        <ProtectedRoute>
          <LazyTuoiAnnunci />
        </ProtectedRoute>
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <ProtectedRoute>
              <LazyAnnunciGrid />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: ROUTES.TECHNICAL_DETAILS,
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <ProtectedRoute>
              <LazyDettagliTecnici />
            </ProtectedRoute>
          </Suspense>
        ),
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.SIGN_IN + "/*",
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazySignInPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.SIGN_UP + "/*",
        element: (
          <Suspense fallback={<LoadingIcon />}>
            <LazySignUpPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: ROUTES.DEBUG,
    element: (
      <Suspense fallback={<LoadingIcon />}>
        <AdminRoute>
          <LazyDebugPage />
        </AdminRoute>
      </Suspense>
    ),
  },
  {
    path: ROUTES.ADMIN,
    element: (
      <Suspense fallback={<LoadingIcon />}>
        <AdminRoute>
          <LazyAdminPanel />
        </AdminRoute>
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingIcon />}>
        <LazyNotFound />
      </Suspense>
    ),
  },
]);
