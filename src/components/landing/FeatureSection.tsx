import { FeatureItems } from "./FeatureItems";

/**
 * Hero 바로 아래 서비스 특징 3개 — Hero와 간격이 멀지 않게 유지한다.
 */
export function FeatureSection() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pt-12">
      <FeatureItems />
    </section>
  );
}
