import { useTravel } from "../../state/TravelContext";
import { LandingHero } from "./LandingHero";

/**
 * Landing entry ? preserves goToConditions CTA flow.
 * Hero layout sizing is controlled via landing-hero.css.
 */
export function LandingPage() {
  const { goToConditions } = useTravel();

  return <LandingHero onStart={goToConditions} />;
}
