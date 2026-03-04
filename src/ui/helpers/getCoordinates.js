export const getCoordinates = async (address) => {
    const encodedAddress = encodeURIComponent(address);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }`
      );
      const data = await response.json();
      if (data.status === "OK") {
        return data.results[0].geometry.location;
      } else {
        toast.error("Indirizzo non valido.");
        return null;
      }
    } catch (err) {
      toast.error("Errore nella geolocalizzazione.");
      return null;
    }
  };