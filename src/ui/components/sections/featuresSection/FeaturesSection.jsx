import SectionTitle from "@/ui/components/common/texts/SectionTitle";
import FeatureCard from "./FeatureCard";
import featureCards from "@/ui/data/featureCards.json";
import Modal from "@/ui/components/common/modals/Modal";
import { useState } from "react";

/**
 * The FeaturesSection component renders a section of the page that displays a list of features, each represented by a FeatureCard component.
 * The section is divided into a grid of cards, with 2 columns on medium-sized screens and 4 columns on large screens.
 * Each card displays an image, title, and short description of the feature, and a "Discover" button to open a modal with more information.
 */
export default function FeaturesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const openModal = (card) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCard(null);
  };

  return (
    <>
      <section
        className=" py-16 max-w-7xl mx-auto px-6"
        id="Trova-la-tua-casa-ideale"
      >
        <SectionTitle>Trova la tua casa ideale</SectionTitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureCards.map((card, index) => (
            <FeatureCard
              key={index}
              imgUrl={card.imgUrl}
              title={card.title}
              desc={card.desc}
              onDiscover={() => openModal(card)}
            />
          ))}
        </div>
      </section>

      {modalOpen && (
        <Modal
          id={"feature-modal"}
          imgUrl={selectedCard.imgUrl}
          title={selectedCard.title}
          fullDesc={
            "<div class='max-w-[370px]'> " + selectedCard.fullDesc + "</div>"
          }
          onClose={closeModal}
        />
      )}
    </>
  );
}
