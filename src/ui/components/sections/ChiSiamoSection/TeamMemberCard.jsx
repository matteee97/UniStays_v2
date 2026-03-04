import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import InfoCard from "@/ui/components/common/cards/InfoCard";

const TeamMemberCard = ({ member, isVisible }) => {
  return (
    <a
      className={`${
        isVisible ? "animate-fadeInUp cursor-pointer" : "opacity-0"
      }`}
      style={{ animationDelay: `${member.id * 200}ms` }}
      href={member.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <InfoCard
        icon={<FontAwesomeIcon icon={faUsers} />}
        title={member.name}
        description={member.description}
        variant="default"
        size="lg"
        hoverable
        className="h-full"
      >
        <div className="text-center mb-4">
          <p className="text-[#228E8D] font-semibold mb-2">{member.role}</p>
          <p className="text-sm text-gray-600 mb-1">{member.university}</p>
          <p className="text-xs text-gray-500">{member.degree}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {member.skills.map((skill, index) => (
            <span
              key={index}
              className="text-xs bg-[#228E8D]/10 text-[#228E8D] px-3 py-1 rounded-full font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </InfoCard>
    </a>
  );
};

export default TeamMemberCard;
