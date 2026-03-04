import { faComment, faEye, faHeart, faStar } from "@fortawesome/free-solid-svg-icons";

export const COLORS = ["#228E8D", "#62C1BA", "#A4E0DB", "#D2F1EF", "#b8e4dd"];

export const ANALYTICS_RANGES = { MIN: 7, MID: 14, MAX: 30 };

export const MODE_ORDER = ["views", "likes", "reviews", "score"];

export const MODE_METRICS = {
  views: {
    key: "totalViews",
    label: "Visualizzazioni",
    totalLabel: "Totale visualizzazioni",
    unitLabel: "visualizzazioni",
    icon: faEye
  },
  likes: {
    key: "likesCount",
    label: "Mi piace",
    totalLabel: "Totale mi piace",
    unitLabel: "mi piace",
    icon: faHeart
  },
  reviews: {
    key: "reviewsCount",
    label: "Recensioni",
    totalLabel: "Totale recensioni",
    unitLabel: "recensioni",
    icon: faComment
  },
  score: {
    key: "score",
    label: "Score UniStays",
    totalLabel: "Score medio",
    unitLabel: "score",
    icon: faStar,
    average: true,
    isFeatured: true,
  },
};

export const MODE_LABELS = MODE_ORDER.reduce((acc, modeKey) => {
  acc[modeKey] = MODE_METRICS[modeKey].label;
  return acc;
}, {});

export const MODE_OPTIONS = MODE_ORDER.map((modeKey) => ({
  value: modeKey,
  label: MODE_METRICS[modeKey].label,
  isFeatured: MODE_METRICS[modeKey].isFeatured,
}));
