import { Provider } from "react-redux";
import { ClerkProvider } from "@clerk/clerk-react";
import { RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

import { router } from "@/app/router";
import store from "@/app/store/store";
import { ThemeProvider } from "@/ui/hooks";
import { LoadingIcon } from "@/ui/components/common";
import UserInit from "@/ui/components/common/clerk/UserInit.jsx";

export default function AppProviders() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider>
          <ClerkProvider
            publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
            routing="path"
            signInUrl="/accedi"
            signUpUrl="/registrati"
            appearance={{
              captcha: { theme: "light", language: "it-IT" },
              variables: {
                colorPrimary: "#228E8D",
                colorText: "#4B5563",
                fontWeight: {
                  normal: 500,
                  medium: 600,
                  semibold: 700,
                  bold: 800,
                },
              },
            }}
          >
            <UserInit />
            <Toaster position="bottom-right" richColors />
            <RouterProvider router={router} fallbackElement={<LoadingIcon />} />
          </ClerkProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  );
}
