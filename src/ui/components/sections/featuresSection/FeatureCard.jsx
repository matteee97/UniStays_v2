export default function FeatureCard({ imgUrl, title, desc, onDiscover }) {
  return (
    <div className="bg-[#D4F1EF] p-6 rounded-2xl shadow-xs transition hover:shadow-lg duration-300 text-center flex flex-col items-center">
      <span className="relative h-10 sm:h-10 w-20 mb-4 overflow-visible">
        <img
          src={imgUrl}
          alt={title}
          className="absolute -top-10 left-0 h-20 w-20 animate-fadeIn"
        />
      </span>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 text-sm">{desc}</p>
      <button
        onClick={onDiscover}
        aria-haspopup="dialog"
        aria-controls="feature-modal"
        className="text-sm bg-[#228E8D] text-white px-4 py-2 rounded-full w-44 flex justify-center items-center gap-2 mx-auto font-medium group hover:shadow-sm transition-all duration-300"
      >
        Scopri di più
        <span
          aria-hidden="true"
          className="block transition-all group-hover:ms-1.5 rtl:rotate-180 group-hover:translate-x-1"
        >
          &rarr;
        </span>
      </button>
    </div>
  );
}
