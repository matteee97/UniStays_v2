import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faShare,
  faFlag,
  faPhone,
  faEnvelope,
  faClock,
  faEye,
  faDownload,
  faPrint,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { useInView, useToggleLike } from "@/ui/hooks";
import { generatePdf } from "@/ui/helpers/generatePdf";
import { formatDate } from "@/ui/helpers/formatDate";
import ReportModal from "@/ui/components/common/reports/ReportModal";

export default function ApartmentExtraFeatures({
  app,
  apartmentId,
  liked,
  setLiked,
  pdfRef,
  socialLinks,
  userID,
}) {
  const [ref, isVisible] = useInView({ threshold: 0.2 });
  const [showContactInfo, setShowContactInfo] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const ownerId = app?.owner?.ownerId || null;
  const toggleLike = useToggleLike(userID, apartmentId, app?.title);
  const contactInfo = app?.owner;

  const reportTarget = apartmentId
    ? {
        type: "apartment",
        id: apartmentId,
        apartmentId,
        ownerId,
        userId: ownerId,
      }
    : null;
  const canReport = Boolean(reportTarget?.apartmentId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      if (pdfRef.current) {
        await generatePdf(pdfRef, apartmentId);
      }
    } catch (error) {
      console.error("Errore durante la generazione del PDF:", error);
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`space-y-6 px-2 pb-6 sm:px-0 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 border border-[#d4f1ef] ">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Azioni rapide
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => toggleLike(liked, setLiked)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl ${
                liked
                  ? "bg-[#228E8D]/10 text-[#228E8D] border border-[#228E8D]/20"
                  : "bg-[#f0fafa] border border-[#fff] dark:border-none text-gray-600 hover:bg-[#228E8D]/10 hover:text-[#228E8D] hover:border-[#228E8D]/20 transition-all duration-300"
              }
            }`}
            >
              <FontAwesomeIcon
                icon={faHeart}
                className="w-5 h-5 text-[#228E8D]"
              />
              <span className="text-sm font-medium">
                {liked ? "Aggiunto ai preferiti" : "Aggiungi ai preferiti"}
              </span>
            </button>

            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#f0fafa] text-gray-600 hover:bg-[#228E8D]/10 hover:text-[#228E8D] hover:border-[#228E8D]/20 transition-all duration-300"
            >
              <FontAwesomeIcon
                icon={faShare}
                className="w-5 h-5 text-[#228E8D]"
              />
              <span className="text-sm font-medium">Condividi</span>
            </button>

            {canReport && (
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#f0fafa] text-gray-600 group hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
                aria-label="Segnala annuncio"
              >
                <FontAwesomeIcon
                  icon={faFlag}
                  className="w-5 h-5 text-[#228E8D] group-hover:text-red-600 transition-colors duration-300"
                />
                <span className="text-sm font-medium">Segnala</span>
              </button>
            )}
          </div>

          {/* Share Menu */}
          {showShareMenu && (
            <div className="mt-4 p-4 bg-[#f0fafa] rounded-xl">
              <h4 className="sr-only">Condividi su:</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {socialLinks.map((social, i) =>
                  social.url ? (
                    <a
                      key={i}
                      className="flex items-center justify-center gap-2 p-2 rounded-lg  text-gray-600 border border-[#d4f1ef] hover:border-[#228E8D]/30 bg-white  hover:text-[#228E8D] transition-colors"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FontAwesomeIcon icon={social.icon} className="w-4 h-4" />
                      <span className="text-sm">{social.label}</span>
                    </a>
                  ) : (
                    <button
                      key={i}
                      className="flex items-center justify-center gap-2 p-2 rounded-lg  text-gray-600 border border-[#d4f1ef] hover:border-[#228E8D]/30 bg-white  hover:text-[#228E8D] transition-colors"
                      onClick={social.action}
                    >
                      <FontAwesomeIcon icon={social.icon} className="w-4 h-4" />
                      <span className="text-sm">{social.label}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-6 border border-[#d4f1ef]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Informazioni di contatto
            </h3>
            <button
              onClick={() => setShowContactInfo(!showContactInfo)}
              className="text-[#228E8D] text-sm font-medium hover:underline"
            >
              {showContactInfo ? "Nascondi" : "Mostra"}
            </button>
          </div>

          {showContactInfo && contactInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#f0fafa] rounded-lg">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-[#228E8D] w-4 h-4"
                />
                <div>
                  <p className="text-sm text-gray-600">Telefono</p>
                  <p className="font-medium">
                    {contactInfo.phone || "Non disponibile"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#f0fafa] rounded-lg">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-[#228E8D] w-4 h-4"
                />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">
                    {contactInfo.email || "Non disponibile"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Property Stats */}
        <div className="bg-white rounded-2xl p-6 border border-[#d4f1ef]">
          <h3 className="sr-only">Statistiche dell'annuncio</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#228E8D]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <FontAwesomeIcon
                  icon={faEye}
                  className="text-[#228E8D] w-5 h-5"
                />
              </div>
              <p className="text-base sm:text-xl font-bold text-gray-600">
                {app?.metrics?.totalViews || 0}
              </p>
              <p className="text-sm text-gray-600">Visualizzazioni</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#228E8D]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <FontAwesomeIcon
                  icon={faHeart}
                  className="text-[#228E8D] w-5 h-5"
                />
              </div>
              <p className="text-base sm:text-xl font-bold text-gray-600">
                {app?.metrics?.likesCount || 0}
              </p>
              <p className="text-sm text-gray-600">Mi piace</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-[#228E8D]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <FontAwesomeIcon
                  icon={faComment}
                  className="text-[#228E8D] w-5 h-5"
                />
              </div>
              <p className="text-base sm:text-xl font-bold text-gray-600">
                {app?.metrics?.ratingCount || 0}
              </p>
              <p className="text-sm text-gray-600">Recensioni</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#228E8D]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <FontAwesomeIcon
                  icon={faClock}
                  className="text-[#228E8D] w-5 h-5"
                />
              </div>
              <p className="text-base sm:text-xl font-bold text-gray-600">
                {formatDate(app?.updatedAt)}
              </p>
              <p className="text-sm text-gray-600">Ultima modifica</p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-2xl p-6 border border-[#d4f1ef]">
          <h3 className="sr-only">Esporta annuncio</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 p-3 bg-[#f0fafa] text-gray-700 rounded-lg hover:bg-[#228E8D]/10 hover:text-[#228E8D] hover:border-[#228E8D]/20 transition-colors"
            >
              <FontAwesomeIcon icon={faPrint} className="w-4 h-4" />
              <span className="font-medium">Stampa annuncio</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center justify-center gap-2 p-3 bg-[#228E8D]/10 text-[#228E8D] rounded-lg hover:bg-[#228E8D]/20 transition-colors"
            >
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
              <span className="font-medium">Scarica PDF</span>
            </button>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        target={reportTarget}
        targetLabel={app?.title ? `annuncio: ${app.title}` : "annuncio"}
        title="Segnala annuncio"
      />
    </>
  );
}
