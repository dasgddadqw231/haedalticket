import { useState } from "react";
import { HeroSection } from "../components/HeroSection";
import { GiftCardGrid } from "../components/GiftCardGrid";
import { FeaturesSection } from "../components/FeaturesSection";
import { SellForm } from "../components/SellForm";
import { RealtimeStatus } from "../components/RealtimeStatus";

export function HomePage() {
  const [preselectedCard, setPreselectedCard] = useState<string | undefined>();

  const handleSelectCard = (cardId: string) => {
    setPreselectedCard(undefined);
    setTimeout(() => setPreselectedCard(cardId), 0);
  };

  return (
    <>
      <HeroSection />
      <GiftCardGrid onSelectCard={handleSelectCard} />
      <FeaturesSection />
      <SellForm preselectedCard={preselectedCard} />
      <RealtimeStatus />
    </>
  );
}