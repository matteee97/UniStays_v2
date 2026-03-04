import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import LoadingIcon from "../shared/icons/loadingIcon";
import Alert from "../messages/Alert";
import MapControls from "./MapControls";
import ApartmentInfoCard from "./ApartmentInfoCard";
import ApartmentMarker from "./ApartmentMarker";
import SingleApartmentMarker from "./SingleApartmentMarker";
import UniversityMarker from "./UniversityMarker";
import { useTheme } from "@/ui/hooks";
import { containerStyle, MAP_LIBRARIES } from "./shared/constants";

export default function GoogleMapComponent({
  appartamenti,
  city,
  hoveredApartmentId,
  favoritesIds,
  zoom = 14,
  isSingle = false,
  universityMarker = false,
}) {
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [hoveredApartment, setHoveredApartment] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);
  const mapRef = useRef(null);
  const [isStreetViewVisible, setIsStreetViewVisible] = useState(false);
  const { theme } = useTheme();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    version: "weekly",
    libraries: MAP_LIBRARIES,
  });
  const mapOptions = useMemo(
    () => ({
      mapId:
        theme === "dark"
          ? "9c2d16fe9025e85d87984591"
          : "9c2d16fe9025e85e4ca4d9be",
      colorScheme: theme === "dark" ? "DARK" : "LIGHT",
      gestureHandling: isSingle ? "cooperative" : "greedy",
      disableDoubleClickZoom: true,
      scrollwheel: !isSingle,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: true,
      disableDefaultUI: true,
    }),
    [isSingle, theme],
  );

  const [center, setCenter] = useState({ lat: 42.35, lng: 13.39 });
  // Geocode centro città
  useEffect(() => {
    if (isSingle && appartamenti.length > 0) {
      if (appartamenti[0].address?.location) {
        setCenter({
          lat: appartamenti[0].address.location._lat,
          lng: appartamenti[0].address.location._long,
        });
      }
    } else if (!isSingle && city) {
      if (city.coords?.lat && city.coords?.lng) {
        setCenter({ lat: city.coords.lat, lng: city.coords.lng });
      }
    }
  }, [city, isSingle, appartamenti]);

  const adjustedAppartamenti = useMemo(() => {
    if (!appartamenti) return;
    const positionMap = new Map();
    return appartamenti.map((app) => {
      if (!app.address?.location) return app;
      let lat = app.address.location._lat;
      let lng = app.address.location._long;
      let key = `${lat.toFixed(5)}-${lng.toFixed(5)}`;

      while (positionMap.has(key)) {
        const offset = Math.random() * 0.0001 - 0.00005;
        lat += offset;
        lng += offset;
        key = `${lat.toFixed(5)}-${lng.toFixed(5)}`;
      }

      positionMap.set(key, true);

      return {
        ...app,
        address: {
          ...app.address,
          location: { _lat: lat, _long: lng },
        },
      };
    });
  }, [appartamenti]);

  const handleSelectApartment = useCallback(
    (app) => {
      // evita di settare se è già selezionato
      if (selectedApartment?.id === app.id) return;
      setSelectedApartment(app);
    },
    [selectedApartment],
  );

  const handleMapLoad = (map) => {
    mapRef.current = map;
    const panorama = map.getStreetView();
    panorama.setOptions({ disableDefaultUI: true });
    panorama.addListener("visible_changed", () => {
      setIsStreetViewVisible(panorama.getVisible());
    });
    map.addListener("bounds_changed", () => {
      const newBounds = map.getBounds();
      if (newBounds) setMapBounds(newBounds);
    });
  };

  const visibleMarkers = useMemo(() => {
    if (!mapBounds || !adjustedAppartamenti) return adjustedAppartamenti;

    const tolerance = 0.0015; // ≈ 150 metri

    const boundsNE = mapBounds.getNorthEast();
    const boundsSW = mapBounds.getSouthWest();

    return adjustedAppartamenti.filter((app) => {
      const pos = app.address?.location;
      if (!pos) return false;

      const lat = pos._lat;
      const lng = pos._long;

      // Aggiungo margine di tolleranza ai bordi
      return (
        lat <= boundsNE.lat() + tolerance &&
        lat >= boundsSW.lat() - tolerance &&
        lng <= boundsNE.lng() + tolerance &&
        lng >= boundsSW.lng() - tolerance
      );
    });
  }, [adjustedAppartamenti, mapBounds]);

  useEffect(() => {
    if (!hoveredApartmentId || !adjustedAppartamenti) {
      setHoveredApartment(null);
      return;
    }

    const hoveredApp = adjustedAppartamenti.find(
      (app) => app?.id === hoveredApartmentId,
    );

    if (hoveredApp) {
      setHoveredApartment(hoveredApp);
    }
  }, [hoveredApartmentId, adjustedAppartamenti]);

  useEffect(() => {
    const targetApartment = hoveredApartment || selectedApartment;

    if (!targetApartment || !mapRef.current || !window.google) return;

    const map = mapRef.current;
    const projection = map.getProjection();

    if (!projection) return;

    const { _lat: lat, _long: lng } = targetApartment.address.location;

    const latLng = new window.google.maps.LatLng(lat, lng);
    const point = projection.fromLatLngToPoint(latLng);

    const zoom = map.getZoom();
    const scale = Math.pow(2, zoom);

    // Offset in pixel per posizionare il marker sopra la card invece che al centro
    const pixelOffsetY = selectedApartment ? -160 : 0; // sposta verso l'alto
    const pixelOffsetX = selectedApartment ? -125 : -32; // sposta verso sinistra (considerando la card larga 250px o il marker 64px)
    const offsetX = pixelOffsetX / scale;
    const offsetY = pixelOffsetY / scale;

    const newPoint = new window.google.maps.Point(
      point.x - offsetX,
      point.y - offsetY,
    );

    const oldPoint = projection.fromLatLngToPoint(map.getCenter());
    const distance = Math.sqrt(
      Math.pow(newPoint.x - oldPoint.x, 2) +
        Math.pow(newPoint.y - oldPoint.y, 2),
    );
    if (!Number.isFinite(distance)) return;
    const pixelDistance = distance * scale;

    // Se la distanza è troppo piccola evita di fare pan/zoom per non creare effetti strani
    if (hoveredApartment && pixelDistance < 200) return;

    const newCenter = projection.fromPointToLatLng(newPoint);
    const originalZoom = map.getZoom();
    if (selectedApartment) {
      map.panTo(newCenter);
      return;
    }
    const zoomWeight = Math.min(1.2, 2.7 * distance); // regola quanto zoomare out in base alla distanza
    const zoomOutLevel = originalZoom - zoomWeight;

    // 1-Zoom out
    map.setZoom(zoomOutLevel);

    // 2-Dopo piccolo delay fai pan
    setTimeout(() => {
      map.panTo(newCenter);

      // 3-Dopo ancora un po' fai zoom in graduale
      let currentZoom = zoomOutLevel;

      const zoomInterval = setInterval(() => {
        currentZoom += zoomWeight;

        if (currentZoom >= originalZoom) {
          map.setZoom(originalZoom);
          clearInterval(zoomInterval);
        } else {
          map.setZoom(currentZoom);
        }
      }, 100);
    }, 300);
  }, [hoveredApartment, selectedApartment]);

  if (loadError)
    return <Alert title="Errore, mappa non caricata:" message={loadError} />;
  if (!isLoaded) return <LoadingIcon />;

  return (
    <div className="relative w-full h-full bg-white">
      <GoogleMap
        key={theme}
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={handleMapLoad}
        options={mapOptions}
        clickableIcons={false}
      >
        {isLoaded &&
          mapRef.current &&
          visibleMarkers &&
          visibleMarkers.map((app) =>
            app.address?.location ? (
              isSingle ? (
                <SingleApartmentMarker key={1} app={app} />
              ) : (
                <ApartmentMarker
                  key={app.id}
                  app={app}
                  map={mapRef.current}
                  onClick={handleSelectApartment}
                  hoveredApartmentId={hoveredApartmentId}
                />
              )
            ) : null,
          )}
        {!isSingle && universityMarker && (
          <UniversityMarker
            position={center}
            name={city?.university || "Università"}
          />
        )}

        {selectedApartment && (
          <ApartmentInfoCard
            apartment={selectedApartment}
            liked={favoritesIds?.has(selectedApartment.id) || false}
            onClose={() => setSelectedApartment(null)}
          />
        )}
      </GoogleMap>

      <MapControls mapRef={mapRef} isStreetViewVisible={isStreetViewVisible} />
    </div>
  );
}
