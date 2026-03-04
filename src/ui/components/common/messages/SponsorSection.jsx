import { Link } from "react-router-dom";

export default function SponsorSection() {
  return (
    <section className="bg-white border-t dark:border-[#1F2937] py-6 px-4 w-full">
      <div className="container mx-auto text-center space-y-3 border border-dashed border-gray-200 rounded-xl p-6">
        <h2 className="text-xl md:text-2xl text-gray-700 font-semibold">
          Spazio disponibile per sponsor locali
        </h2>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          Hai un’attività nella zona? Bar, pizzerie, pub o servizi per studenti?
          <span className="font-medium text-[#228E8D]">
            {" "}
            Il tuo brand può comparire qui.{" "}
          </span>
          Contattaci per scoprire come diventare sponsor.
        </p>
        <div>
          <Link
            to={"/contatti/collaborazione#contatti-form"}
            className="bg-[#228E8D] hover:shadow-md text-white font-semibold text-sm py-2 px-4 rounded-lg transition-all duration-300"
          >
            Diventa Sponsor
          </Link>
        </div>
      </div>
    </section>
  );
}
