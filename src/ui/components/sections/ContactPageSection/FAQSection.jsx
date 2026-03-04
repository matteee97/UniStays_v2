import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const FAQSection = ({ faqData }) => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">
            Domande Frequenti
          </h3>
          <p className="text-lg text-gray-500 font-medium">
            Tutte le risposte che stai cercando
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="border-2 border-[#d4f1ef] rounded-lg overflow-hidden hover:border-[#228E8D] transition-colors duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors duration-300 flex items-center justify-between"
              >
                <span className="font-semibold text-gray-700">
                  {faq.question}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`${
                    openIndex === index ? "-rotate-180" : ""
                  } text-[#228E8D] transition-transform duration-300 ease-in-out`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 py-4 bg-white border-t border-[#d4f1ef]">
                  <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
