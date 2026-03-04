import { useEffect } from "react";
import MetaManager from "@/ui/components/common/seo/MetaManager";
import {
  ContactInfoSection,
  ContactFormSection,
  StatsSection,
  TestimonialsSection,
  FAQSection,
} from "@/ui/components/sections/ContactPageSection";
import { useContactForm } from "@/ui/hooks";
import {
  contactInfo,
  contactReasons,
  formFields,
  testimonials,
  faqData,
} from "@/ui/data/contactPageData";
import ScrollToHashElement from "@/ui/helpers/ScrollToHashElement";
import { HeroBackground } from "@/ui/components/sections/heroSection";

export default function ContactPage() {
  const {
    formRef,
    loading,
    reason,
    handleSubmit,
  } = useContactForm();

  useEffect(() => {
    if (!reason) {
      window.scrollTo(0, 0);
    }
  }, [reason]);

  return (
    <>
      <MetaManager />
      <ScrollToHashElement />

      {/* Hero Section */}
      <section className="bg-white relative md:h-screen md:flex md:items-center md:justify-center">
        {/* Background with parallax effect */}
        <HeroBackground urlImage={"/img/contactPageBg.webp"} />

        <ContactInfoSection contactInfo={contactInfo} />
      </section>

      {/* Form Section */}
      <section className="dark:bg-[#0B1220] py-16">
        <div className="max-w-7xl mx-auto">
          <ContactFormSection
            formRef={formRef}
            handleSubmit={handleSubmit}
            loading={loading}
            reason={reason}
            contactReasons={contactReasons}
            formFields={formFields}
          />
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection stats={contactInfo.stats} />

      {/* Testimonials Section */}
      <TestimonialsSection testimonials={testimonials} />

      {/* FAQ Section */}
      <FAQSection faqData={faqData} />
    </>
  );
}
