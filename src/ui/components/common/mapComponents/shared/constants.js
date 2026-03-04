export const containerStyle = { width: "100%", height: "100%" };
export const MAP_LIBRARIES = ["marker"];

/* export const MAP_STYLES = {
  dark: {
    variant: "dark",
    styles: [
      {
        id: "infrastructure",
        label: {
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "infrastructure.building",
        geometry: {
          fillColor: "#1f2937",
          strokeColor: "#0f1829",
          strokeWidth: 0.5,
        },
      },
      {
        id: "infrastructure.railwayTrack",
        geometry: {
          visible: true,
        },
      },
      {
        id: "infrastructure.roadNetwork",
        geometry: {
          fillColor: "#1f2937",
          strokeColor: "#0f1829",
        },
        label: {
          visible: false,
          textFillColor: "#e2e8f0",
          textStrokeColor: "#0f172a",
        },
      },
      {
        id: "infrastructure.transitStation.busStation",
        label: {
          pinFillColor: "#1a6b6a",
        },
      },
      {
        id: "natural.land",
        geometry: {
          fillColor: "#122529",
        },
      },
      {
        id: "natural.water.lake",
        label: {
          textFillColor: "#4b5563",
        },
      },
      {
        id: "natural.water.ocean",
        label: {
          textFillColor: "#4b5563",
        },
      },
      {
        id: "pointOfInterest",
        geometry: {
          fillColor: "#1f2937",
        },
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
          textStrokeColor: "#1f2937",
        },
      },
      {
        id: "pointOfInterest.emergency.hospital",
        geometry: {
          fillColor: "#1f2937",
        },
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.entertainment",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.entertainment.arts",
        label: {
          visible: true,
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.entertainment.casino",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.entertainment.cinema",
        label: {
          visible: true,
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.entertainment.historic",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.entertainment.museum",
        label: {
          visible: true,
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.bar",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.cafe",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.restaurant",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.winery",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.landmark",
        label: {
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.lodging",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.other",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.other.bridge",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.other.cemetery",
        geometry: {
          fillColor: "#1f2937",
        },
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.other.library",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.other.school",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
          textStrokeColor: "#1f2937",
        },
      },
      {
        id: "pointOfInterest.recreation.beach",
        geometry: {
          fillColor: "#1f2937",
        },
      },
      {
        id: "pointOfInterest.recreation.golfCourse",
        geometry: {
          fillColor: "#1f2937",
        },
      },
      {
        id: "pointOfInterest.recreation.natureReserve",
        geometry: {
          fillColor: "#1f2937",
        },
      },
      {
        id: "pointOfInterest.recreation.park",
        geometry: {
          fillColor: "#1f2937",
        },
      },
      {
        id: "pointOfInterest.recreation.sportsComplex",
        geometry: {
          fillColor: "#1f2937",
        },
      },
      {
        id: "pointOfInterest.retail",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.service",
        geometry: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.service.parkingLot",
        label: {
          visible: false,
          pinFillColor: "#1a6b6a",
          textFillColor: "#e2e8f0",
        },
      },
      {
        id: "pointOfInterest.transit",
        geometry: {
          visible: true,
        },
      },
      {
        id: "pointOfInterest.transit.airport",
        geometry: {
          visible: false,
        },
      },
      {
        id: "political.border",
        geometry: {
          color: "#111827",
        },
      },
      {
        id: "political.city",
        label: {
          pinFillColor: "#1a6b6a",
          textFillColor: "#d1d5db",
          textStrokeColor: "#1f2937",
        },
      },
      {
        id: "political.countryOrRegion",
        label: {
          textFillColor: "#9ca3af",
          textStrokeColor: "#1f2937",
        },
      },
      {
        id: "political.landParcel",
        geometry: {
          visible: false,
        },
      },
      {
        id: "political.neighborhood",
        label: {
          textFillColor: "#9ca3af",
          textStrokeColor: "#1f2937",
        },
      },
      {
        id: "political.reservation",
        geometry: {
          visible: false,
          strokeColor: "#9ca3af",
        },
        label: {
          textFillColor: "#9ca3af",
        },
      },
      {
        id: "political.stateOrProvince",
        geometry: {
          fillColor: "#0f1829",
        },
        label: {
          textFillColor: "#6b7280",
          textStrokeColor: "#1f2937",
        },
      },
      {
        id: "political.sublocality",
        label: {
          visible: false,
        },
      },
    ],
  },
  light: {
    variant: "light",
    styles: [
      {
        id: "infrastructure",
        label: {
          textFillColor: "#2fa793",
        },
      },
      {
        id: "infrastructure.building",
        geometry: {
          fillColor: "#cfe7e6",
          strokeColor: "#b7c8c6",
          strokeWidth: 0.5,
        },
      },
      {
        id: "infrastructure.railwayTrack",
        geometry: {
          visible: true,
        },
      },
      {
        id: "infrastructure.roadNetwork",
        geometry: {
          fillColor: "#b4c5c2",
          strokeColor: "#b4c5c2",
        },
        label: {
          visible: false,
          textFillColor: "#b4c5c2",
          textStrokeColor: "#b4c5c2",
        },
      },
      {
        id: "infrastructure.transitStation.busStation",
        label: {
          pinFillColor: "#238b80",
        },
      },
      {
        id: "natural.land",
        geometry: {
          fillColor: "#b1e2d2",
        },
      },
      {
        id: "natural.water.lake",
        label: {
          textFillColor: "#d4f1ef",
        },
      },
      {
        id: "natural.water.ocean",
        label: {
          textFillColor: "#d4f1ef",
        },
      },
      {
        id: "pointOfInterest",
        geometry: {
          fillColor: "#2fa793",
        },
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.emergency.hospital",
        geometry: {
          fillColor: "#d4f1ef",
        },
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.entertainment",
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.entertainment.arts",
        label: {
          visible: true,
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.entertainment.casino",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.entertainment.cinema",
        label: {
          visible: true,
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.entertainment.historic",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.entertainment.museum",
        label: {
          visible: true,
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.bar",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.cafe",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.restaurant",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.foodAndDrink.winery",
        label: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.landmark",
        label: {
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.lodging",
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa79e",
        },
      },
      {
        id: "pointOfInterest.other",
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.other.bridge",
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.other.cemetery",
        geometry: {
          fillColor: "#d4f1ef",
        },
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.other.library",
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.other.school",
        label: {
          pinFillColor: "#676f6e",
          textFillColor: "#238b80",
          textStrokeColor: "#e7f9f5",
        },
      },
      {
        id: "pointOfInterest.recreation.beach",
        geometry: {
          fillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.recreation.golfCourse",
        geometry: {
          fillColor: "#d4f1ef",
        },
      },
      {
        id: "pointOfInterest.recreation.natureReserve",
        geometry: {
          fillColor: "#c3f1d5",
        },
      },
      {
        id: "pointOfInterest.recreation.park",
        geometry: {
          fillColor: "#d4f1ef",
        },
      },
      {
        id: "pointOfInterest.recreation.sportsComplex",
        geometry: {
          fillColor: "#d4f1ef",
        },
      },
      {
        id: "pointOfInterest.retail",
        label: {
          pinFillColor: "#2fa793",
          textFillColor: "#2fa793",
        },
      },
      {
        id: "pointOfInterest.service",
        geometry: {
          visible: false,
        },
      },
      {
        id: "pointOfInterest.service.parkingLot",
        label: {
          visible: false,
          pinFillColor: "#228e8d",
          textFillColor: "#ffffff",
        },
      },
      {
        id: "pointOfInterest.transit",
        geometry: {
          visible: true,
        },
      },
      {
        id: "pointOfInterest.transit.airport",
        geometry: {
          visible: false,
        },
      },
      {
        id: "political.border",
        geometry: {
          color: "#9b9ea1",
        },
      },
      {
        id: "political.city",
        label: {
          pinFillColor: "#498d81",
          textFillColor: "#228e8d",
          textStrokeColor: "#d4f1ef",
        },
      },
      {
        id: "political.countryOrRegion",
        label: {
          textFillColor: "#228e8d",
          textStrokeColor: "#d4f1ef",
        },
      },
      {
        id: "political.landParcel",
        geometry: {
          visible: false,
        },
      },
      {
        id: "political.neighborhood",
        label: {
          textFillColor: "#228e8d",
          textStrokeColor: "#d4f1ef",
        },
      },
      {
        id: "political.reservation",
        geometry: {
          visible: false,
          strokeColor: "#e4e7e4",
        },
        label: {
          textFillColor: "#b1b3b4",
        },
      },
      {
        id: "political.stateOrProvince",
        geometry: {
          fillColor: "#868383",
        },
        label: {
          textFillColor: "#228e8d",
          textStrokeColor: "#d4f1ef",
        },
      },
      {
        id: "political.sublocality",
        label: {
          visible: false,
        },
      },
    ],
  },
}; */
