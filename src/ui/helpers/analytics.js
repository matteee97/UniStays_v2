import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize([
      {
        trackingId: import.meta.env.VITE_GA_TRACKING_ID,
        gaOptions: {
          send_page_view: false, 
        },
      },
    ],);
};

export const sendPageView = (path) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};