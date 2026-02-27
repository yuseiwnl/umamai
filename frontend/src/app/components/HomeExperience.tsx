"use client";

import { useCallback, useState } from "react";
import SplashScreen from "./SplashScreen";
import HamburgerMenu from "./HamburgerMenu";
import SwipeCards from "./SwipeCards";
import TutorialModal from "./TutorialModal";
import type { ImageItem } from "@/lib/FetchImages";

type HomeExperienceProps = {
  cardData: ImageItem[];
};

export default function HomeExperience({ cardData }: HomeExperienceProps) {
  const [tutorialReady, setTutorialReady] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setTutorialReady(true);
  }, []);

  return (
    <div
      className="
          relative overflow-hidden min-h-[100dvh]
          p-[env(safe-area-inset)]
        "
    >
      <SplashScreen onComplete={handleSplashComplete} />
      <HamburgerMenu />
      <SwipeCards cardData={cardData} />
      {tutorialReady && <TutorialModal />}
    </div>
  );
}
