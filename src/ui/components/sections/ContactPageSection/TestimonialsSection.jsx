import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faQuoteLeft } from "@fortawesome/free-solid-svg-icons";
import { renderStars } from "@/ui/helpers/renderStars.jsx";

const TestimonialsSection = ({ testimonials }) => {
  return (
    <div className="bg-[#f0faf9] dark:bg-[#0B1220] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Cosa dicono di noi
          </h3>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Le testimonianze dei nostri utenti soddisfatti parlano da sole
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-[#d4f1ef] hover:shadow-md transition-shadow duration-300 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-[#228E8D] rounded-full flex items-center justify-center mr-4 group-hover:bg-[#1e7675] transition-colors duration-300">
                  <FontAwesomeIcon
                    icon={faQuoteLeft}
                    className="text-white text-lg"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-700">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              <div className="mb-4">{renderStars(testimonial.rating)}</div>

              <p className="text-gray-500 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
