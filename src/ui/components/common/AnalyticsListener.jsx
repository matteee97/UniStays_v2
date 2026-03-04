import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sendPageView } from "@/ui/helpers/analytics";

const AnalyticsListener = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;

    const apartmentPageRegex = /^\/alloggi\/[^/]+\/[^/]+$/;

    if (apartmentPageRegex.test(path)) {
      return; // skip tracking
    }
    sendPageView(path);
  }, [location]);

  return null;
};

export default AnalyticsListener;
