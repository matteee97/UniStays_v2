import HostCard from "@/ui/components/common/cards/HostCard";
import { useIsVerifiedHost } from "@/ui/hooks";
import { Link } from "react-router-dom";
import HostBio from "./HostBio";

export default function OwnerInfoSection({ owner }) {
  if (!owner) return null;

  const { displayName, bio, roleBadge, inPlatformSince, photoUrl, ownerId } =
    owner;

  const createdAt = inPlatformSince || owner?.createdAt || null;
  const userId = ownerId || owner?.userId || null;

  const resolvedDisplayName =
    displayName ||
    [owner?.firstName, owner?.lastName].filter(Boolean).join(" ") ||
    "Nome non trovato";
  const resolvedBio = bio || owner?.bio || undefined;
  const isAgencyResolved = Boolean(owner?.isAgency || roleBadge === "agency");
  const roleLabel = isAgencyResolved ? "Agenzia Immobiliare" : "Proprietario";
  const isVerified = useIsVerifiedHost(owner);

  return (
    <div className="w-full flex flex-col gap-6 px-2 sm:px-0">
      <div className="max-w-7xl mx-auto md:mx-0 grid grid-cols-1 md:grid-cols-[400px_1fr] gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-start justify-start">
        {/* 🧾 SINISTRA */}
        <HostCard
          roleLabel={roleLabel}
          photoUrl={photoUrl}
          displayName={resolvedDisplayName}
          bio={resolvedBio}
          date={createdAt}
          isVerified={isVerified}
          userId={userId}
        />

        {/* DESTRA */}
        <div className="flex flex-col h-full items-center md:items-start justify-center sm:p-2 md:py-4 gap-6">
          {/* BIO */}
          {bio && <HostBio host={owner} />}

          {/* VAI AL PROFILO */}
          <Link
            to={userId ? `/host/${userId}` : "#"}
            className="hover:text-[#228E8D]
            bg-[#f0fafb] dark:bg-[#131e32] text-gray-600 font-medium rounded-md w-fit py-3 px-10 ml-4 shadow-sm transition-colors duration-200"
          >
            Mostra tutti gli annunci
          </Link>
        </div>
      </div>
    </div>
  );
}
