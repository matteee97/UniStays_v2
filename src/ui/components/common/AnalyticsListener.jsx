import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sendPageView } from "@/ui/helpers/analytics";
import { useCookieConsent } from "@/ui/hooks";

const AnalyticsListener = () => {
  const location = useLocation();
  const { hasConsentFor, categories } = useCookieConsent();
  const analyticsEnabled = hasConsentFor(categories.ANALYTICS);

  useEffect(() => {
    if (!analyticsEnabled) return;

    const path = location.pathname + location.search;

    const apartmentPageRegex = /^\/alloggi\/[^/]+\/[^/]+$/;

    if (apartmentPageRegex.test(path)) {
      return; // skip tracking
    }
    sendPageView(path);
  }, [analyticsEnabled, location]);

  return null;
};

export default AnalyticsListener;
