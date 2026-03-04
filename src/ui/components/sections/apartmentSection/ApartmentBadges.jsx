import { FeaturedBadge, NewBadge, RatingBadge } from "@/ui/components/common/badges";

export default function ApartmentBadges({ app, averageRating = null }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      {app?.isFeatured && <FeaturedBadge />}

      {/* Badge Nuovo se pubblicato negli ultimi 14 giorni */}
      {(() => {
        if (!app?.createdAt) return null;
        // Se è un oggetto Firebase Timestamp, usa .toDate()
        let createdDate;
        if (typeof app.createdAt.toDate === "function") {
          createdDate = app.createdAt.toDate();
        } else {
          // fallback: se è già una Date o stringa compatibile
          createdDate = new Date(app.createdAt);
        }
        const now = new Date();
        const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
        if (diffDays <= 14) {
          return <NewBadge />;
        }
        return null;
      })()}

      {averageRating > 0 && <RatingBadge round rating={averageRating} />}
    </div>
  );
}
