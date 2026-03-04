import React, { useCallback, useEffect, useState } from "react";
import FormInput from "@/ui/components/common/form/FormInput";
import CoolButton from "@/ui/components/common/buttons/CoolButton";
import { Link } from "react-router-dom";
import { ROUTES } from "@/app/routes";

const ContactFormSection = ({
  formRef,
  handleSubmit,
  loading,
  reason,
  contactReasons,
  formFields,
}) => {
  const resolveReason = useCallback(
    (value) => {
      const normalized = typeof value === "string" ? value.trim() : "";
      const hasMatch = contactReasons.some((item) => item.value === normalized);
      if (hasMatch) return normalized;
      return contactReasons[0]?.value || "";
    },
    [contactReasons]
  );

  const [selectedReason, setSelectedReason] = useState(() =>
    resolveReason(reason)
  );

  useEffect(() => {
    setSelectedReason(resolveReason(reason));
  }, [reason, resolveReason]);

  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
  };

  return (
    <section className="w-full pb-8 sm:px-4 md:pr-10" id="contatti-form">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="bg-[#F0FAF9] dark:bg-[#0F1829] sm:rounded-xl px-6 py-8 sm:px-8 border-2 border-[#d4f1ef]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonna sinistra - Campi del form */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Motivo del contatto
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Seleziona il motivo più appropriato per il tuo contatto
              </p>
            </div>

            <div className="space-y-2">
              {contactReasons.map((contactReason) => (
                <label
                  key={contactReason.value}
                  className="flex items-start gap-4 p-3 border-2 border-[#D4F1EF] rounded-lg cursor-pointer hover:border-[#228E8D] transition-colors duration-300 group bg-white"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={contactReason.value}
                    checked={selectedReason === contactReason.value}
                    onChange={handleReasonChange}
                    className="mt-1 text-[#228E8D] focus:ring-[#228E8D]"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 group-hover:text-[#228E8D] transition-colors duration-300 mb-2">
                      {contactReason.label}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      {contactReason.description}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contactReason.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="text-xs bg-[#228E8D]/10 text-[#228E8D] px-3 py-1 rounded-full font-medium"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Colonna destra - Motivi di contatto */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                I tuoi dati
              </h3>
            </div>

            {/* Nome */}
            <div>
              <label className="block font-medium text-gray-500 mb-1">
                {formFields.name.label}
              </label>
              <FormInput
                name="name"
                placeholder={formFields.name.placeholder}
                required={formFields.name.required}
                type={formFields.name.type}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block font-medium text-gray-500 mb-1">
                {formFields.email.label}
              </label>
              <FormInput
                name="email"
                type={formFields.email.type}
                placeholder={formFields.email.placeholder}
                required={formFields.email.required}
              />
            </div>

            {/* Honey pot per spam */}
            <input
              type="text"
              name="surname"
              className="hidden"
              tabIndex="-1"
              autoComplete="off"
            />

            {/* Messaggio */}
            <div>
              <label className="block font-medium text-gray-500 mb-1">
                {formFields.message.label}
              </label>
              <textarea
                name="message"
                rows={formFields.message.rows}
                required={formFields.message.required}
                placeholder={formFields.message.placeholder}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#D4F1EF] focus:outline-none focus:ring-2 focus:ring-[#228E8D] resize-none"
              />
            </div>

            {/* Pulsante di invio */}
            <CoolButton type="submit" disabled={loading} className="w-full">
              {loading ? "Invio in corso..." : "Invia messaggio"}
            </CoolButton>

            {/* Informazioni aggiuntive */}
            <div className="text-xs text-gray-400 text-center">
              <p>Risponderemo il prima possibile durante i giorni lavorativi</p>
              <p>
                I tuoi dati sono protetti secondo la nostra{" "}
                <Link to={ROUTES.PRIVACY} className="underline text-gray-600">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default ContactFormSection;
