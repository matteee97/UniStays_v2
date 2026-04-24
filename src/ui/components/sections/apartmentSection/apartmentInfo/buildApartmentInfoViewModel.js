/**
 * Normalizza il payload dell'annuncio per mantenere ApartmentInfo puramente compositivo.
 */
export function buildApartmentInfoViewModel(app = {}) {
  const features = app?.features || {};
  const aggregates = app?.aggregates || {};
  const host = app?.owner || app?.ownerSnapshot || {};
  const totalRoomsAvailable = aggregates.totalRoomsAvailable;
  const availabilityLabel = Number.isFinite(totalRoomsAvailable)
    ? `Disponibilita per ${totalRoomsAvailable} stanz${
        totalRoomsAvailable > 1 ? "e" : "a"
      }`
    : "Disponibilita su richiesta";

  return {
    additionalInfo: app?.additionalInfo || "",
    aggregates,
    availabilityLabel,
    description: app?.description || "Descrizione non presente",
    features,
    host,
    hostPhotoUrl: host?.photoUrl || "",
    isAgency: host?.isAgency || host?.roleBadge === "agency",
    occupants: app?.occupants || [],
    ownerId: host?.ownerId,
    quickStats: [
      {
        label: "Camere",
        value: aggregates.totalRooms ?? "-",
        helper: aggregates.totalRooms > 1 ? "Camere totali" : "Camera totale",
      },
      {
        label: "Bagni",
        value: features.bathroomsCount ?? "-",
        helper:
          features.bathroomsCount > 1 ? "Bagni disponibili" : "Bagno privato",
      },
      {
        label: "Superficie",
        value: features.totalAreaMq ? `${features.totalAreaMq} m²` : "-",
        helper: "Spazio abitabile",
      },
      {
        label: "Stanze disponibili",
        value: totalRoomsAvailable ?? "-",
        helper: availabilityLabel,
      },
    ],
    rooms: app?.rooms || [],
  };
}
