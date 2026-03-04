import { Link } from "react-router-dom";

import { toast } from "sonner";

import ArrowIcon from "@/ui/components/common/shared/icons/ArrowIcon";
import IconMailBox from "@/ui/components/common/shared/icons/MailBoxIcon";

/**
 * NewsLetter component renders a newsletter subscription section with a background image.
 *
 * @param {string} imgUrl - The URL for the background image.
 * @param {string} whatsNewText - Text indicating what's new.
 * @param {string} title - The main title of the newsletter section.
 * @param {string} subTitle - The subtitle or description text.
 *
 * @returns {JSX.Element} A React component that displays a newsletter section with an email signup form.
 */
export default function NewsLetter({ imgUrl, whatsNewText, title, subTitle }) {
  return (
    <section
      className={"bg-cover bg-center z-0 "}
      style={{ backgroundImage: `url(${imgUrl})` }}
    >
      <div className="dark:bg-[#0B1220]/70">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 relative">
          <Link
            to={"/contatti"}
            className="inline-flex justify-between items-center py-1 px-1 pe-4 mb-7 text-sm text-gray-700 bg-[#D4F1EF] rounded-full"
          >
            <span className="text-xs bg-[#228E8D] rounded-full text-white px-4 py-1.5 me-3">
              New
            </span>{" "}
            <span className="text-sm font-medium">{whatsNewText}</span>
            <ArrowIcon className={"w-2.5 h-2.5 ms-2 -rotate-90"} />
          </Link>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            {title}
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 lg:px-48 dark:text-gray-200">
            {subTitle}
          </p>
          <form className="w-full max-w-md mx-auto">
            <label
              htmlFor="default-email"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
            >
              Email sign-up
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 rtl:inset-x-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <IconMailBox
                  className={"w-4 h-4 text-gray-500 dark:text-gray-400"}
                />
              </div>
              <input
                type="email"
                id="default-email"
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#228E8D]"
                placeholder="Enter your email here..."
                required
              />
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  toast.warning(
                    "Ci scusiamo per il disagio, ma la newsletter è momentaneamente non disponibile."
                  );
                }}
                title="Momentaneamente non disponibile"
                className="text-white absolute end-2.5 bottom-2.5 bg-[#228E8D] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
              >
                Iscriviti
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
