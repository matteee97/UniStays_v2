import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
  faHeadset,
  faClock,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import InfoCard from "@/ui/components/common/cards/InfoCard";

const ContactInfoSection = ({ contactInfo }) => {
  const getIcon = (iconName) => {
    const icons = {
      faEnvelope,
      faPhone,
      faLocationDot,
      faHeadset,
      faClock,
      faShieldAlt,
    };
    return icons[iconName];
  };

  return (
    <div className=" text-white py-16 z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 px-6 relative z-10">
          <div className="w-20 h-20 bg-white/80 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon
              icon={faHeadset}
              className="text-3xl text-[#228E8D]"
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {contactInfo.title}
          </h2>
          <p className="text-xl opacity-80 max-w-2xl mx-auto leading-relaxed">
            {contactInfo.subtitle}
          </p>
        </div>

        {/* Description */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 mx-6 mb-12 border border-gray-300">
          <p className="text-lg leading-relaxed mb-4 text-gray-700">
            {contactInfo.description}
          </p>
          <p className="text-base opacity-90 text-gray-600">
            <strong>{contactInfo.collaborationText}</strong>
          </p>
        </div>

        {/* Contact Details */}
        <div className="flex w-full gap-6 px-6 sm:px-6 z-10 overflow-x-auto md:grid md:grid-cols-3 md:overflow-x-visible scrollbar-thin scrollbar-thumb-[#228E8D]/30 scrollbar-track-transparent pb-2">
          {contactInfo.contactDetails.map((detail, index) => (
            <div
              key={index}
              className="w-[260px] h-[230px] flex-shrink-0 md:min-w-0 md:flex-shrink md:w-auto"
            >
              <InfoCard
                icon={<FontAwesomeIcon icon={getIcon(detail.icon)} />}
                title={detail.value}
                description={detail.description}
                hoverable={false}
                variant="secondary"
                size="lg"
                clickable
                className="z-20 h-full"
              />
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-8 text-sm opacity-90">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faClock} className="text-[#228E8D]" />
              <span>Risposta rapida</span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} className="text-[#228E8D]" />
              <span>Supporto sicuro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
