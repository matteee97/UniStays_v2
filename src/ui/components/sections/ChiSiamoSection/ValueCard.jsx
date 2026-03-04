import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InfoCard from "@/ui/components/common/cards/InfoCard";

const ValueCard = ({ value, isVisible }) => (
  <div
    className={`${isVisible ? "animate-fadeInUp" : "opacity-0"}`}
    style={{ animationDelay: `${value.title.length * 100}ms` }}
  >
    <InfoCard
      icon={<FontAwesomeIcon icon={value.icon} />}
      title={value.title}
      description={value.description}
      variant="default"
      size="lg"
      className="h-full"
    />
  </div>
);

export default ValueCard;
