import React from "react";
import CoolButton from "@/ui/components/common/buttons/CoolButton";
import { Link } from "react-router-dom";

const CallToAction = ({ isVisible }) => {
  return (
    <div
      className={`text-center mt-20 ${
        isVisible ? "animate-fadeInUp" : "opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-[#d4f1ef] to-[#e8f9f8] dark:from-[#0F172A] dark:to-[#0F172A] rounded-2xl p-8 border-2 border-[#d4f1ef] text-gray-700">
        <h3 className="text-2xl font-bold mb-4">
          Unisciti alla Nostra Missione
        </h3>
        <p className="text-gray-500 mb-6 max-w-2xl mx-auto">
          Aiutaci a rendere la ricerca di alloggi universitari più semplice,
          trasparente e accessibile per tutti gli studenti italiani.
        </p>
        <Link to="/contatti/collaborazione#contatti-form">
          <CoolButton className="px-6 py-2 border-2 border-white/20 text-white">
            Unisciti alla Nostra Community
          </CoolButton>
        </Link>
      </div>
    </div>
  );
};

export default CallToAction;
