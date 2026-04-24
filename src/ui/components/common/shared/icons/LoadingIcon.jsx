export default function LoadingIcon({ fullScreen = false }) {
  return (
    <>
      <style>{`
        @keyframes unistays-loading-bar {
          0% {
            transform: translateX(-115%) scaleX(0.85);
          }
          45% {
            transform: translateX(18%) scaleX(1);
          }
          100% {
            transform: translateX(130%) scaleX(0.9);
          }
        }
      `}</style>

      <div
        className={`pointer-events-none z-[99999] ${
          fullScreen
            ? "absolute inset-x-0 bottom-0"
            : "fixed inset-x-0 bottom-0"
        }`}
        aria-live="polite"
        aria-label="Caricamento in corso"
      >
        <div className="w-full">
          <div className="relative h-1.5 overflow-hidden rounded-none bg-white/55 shadow-[0_10px_30px_-18px_rgba(34,142,141,0.5)] backdrop-blur-md dark:bg-[#0F1829]/65 dark:border-[#7be0de]/10">
            <div
              className="absolute inset-y-0 w-[78%] rounded-full bg-[linear-gradient(90deg,rgba(34,142,141,0.05),rgba(34,142,141,0.92),rgba(110,231,229,0.9))]"
              style={{
                animation:
                  "unistays-loading-bar 1.9s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
