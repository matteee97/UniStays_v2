import GlassContainer from "../containers/GlassContainer";

export default function MapControls({ mapRef, isStreetViewVisible }) {
  const handleFullscreen = () => {
    const mapDiv = mapRef.current.getDiv();
    if (mapDiv.requestFullscreen) mapDiv.requestFullscreen();
    else if (mapDiv.webkitRequestFullscreen) mapDiv.webkitRequestFullscreen();
    else if (mapDiv.msRequestFullscreen) mapDiv.msRequestFullscreen();
  };

  const zoomIn = () => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() + 1);
  };
  const zoomOut = () => {
    if (mapRef.current) mapRef.current.setZoom(mapRef.current.getZoom() - 1);
  };

  return (
    <>
      <div className="absolute hidden sm:block top-2.5 right-2.5 z-10">
        <div className="w-[39px] flex items-center justify-center py-1 text-xl text-[#228E8D] dark:text-[#fff] bg-white/90 dark:bg-[#0F1829]/90 backdrop-blur-sm border-[#d4f1ef] border-2 rounded-full">
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={handleFullscreen}
          >
            ⛶
          </button>
        </div>
      </div>
      {!isStreetViewVisible && (
        <div className="absolute top-14 right-2.5 z-10">
          <div className="flex flex-col py-2 text-lg text-[#228E8D] dark:text-[#fff] bg-white/90 dark:bg-[#0F1829]/90 backdrop-blur-sm border-[#d4f1ef] border-2 rounded-full">
            <button type="button" aria-label="Zoom in" onClick={zoomIn}>
              +
            </button>
            <div className="w-[35px] border-b pb-1 border-gray-300/10"></div>
            <button type="button" aria-label="Zoom out" onClick={zoomOut}>
              −
            </button>
          </div>
        </div>
      )}
    </>
  );
}
