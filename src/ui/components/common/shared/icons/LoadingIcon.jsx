export default function LoadingIcon({ fullScreen = false }) {
  return (
    <div
      className={`h-full ${
        fullScreen ? "absolute w-full" : "fixed left-0 top-0 w-screen"
      } bg-white/10 dark:bg-white/5 z-[99999] text-[#228E8D] font-medium gap-3 flex flex-col items-center justify-center`}
    >
      <div className="bg-white/90 dark:bg-[#0F1829]/90 backdrop-blur-md rounded-full p-8 shadow-[0_0_12px_7px_#228E8D3f] border-2 border-[#228e8c96]">
        <div className="w-14 h-14 rounded-full animate-spin border-l-[2.5px] border-[#228E8D]" />
      </div>
    </div>
  );
}
