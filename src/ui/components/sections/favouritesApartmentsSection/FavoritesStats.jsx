import React from "react";
import WhiteContainer from "@/ui/components/common/containers/WhiteContainer";
import CountUp from "react-countup";
import { APARTMENT_STATUS } from "@/shared/types";

export default function FavoritesStats({ favorites }) {
  return (
    <WhiteContainer className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            I tuoi preferiti ({favorites.length})
          </h2>
          <p className="text-gray-600 text-sm">
            Gestisci e confronta i tuoi annunci salvati
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#2c9f9d] rounded-full"></span>
            <span>Disponibile</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
            <span>Occupato</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#1F2937]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-[#228E8D]">
              <CountUp
                end={
                  favorites.filter(
                    (apt) => apt.status === APARTMENT_STATUS.PUBLISHED
                  ).length
                }
                duration={3.5}
              />
            </div>
            <div className="text-gray-500">Disponibili</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[#228E8D]">
              <CountUp
                end={
                  favorites.length > 0
                    ? Math.round(
                        favorites.reduce(
                          (sum, apt) =>
                            sum + (Number(apt.aggregates?.minRoomPrice) || 0),
                          0
                        ) / favorites.length
                      )
                    : 0
                }
                duration={3.5}
              />
              €
            </div>
            <div className="text-gray-500">Prezzo medio</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[#228E8D]">
              <CountUp
                end={
                  new Set(
                    favorites.map((apt) => apt.address?.city).filter(Boolean)
                  )
                    .size
                }
                duration={1.5}
              />
            </div>
            <div className="text-gray-500">Città</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-[#228E8D]">
              <CountUp end={favorites.length} duration={3.5} />
            </div>
            <div className="text-gray-500">Totale</div>
          </div>
        </div>
      </div>
    </WhiteContainer>
  );
}
