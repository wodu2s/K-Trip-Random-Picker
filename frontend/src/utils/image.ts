import { Destination } from '../types/destination';

const THEME_GRADIENTS: Record<string, string> = {
  바다: 'from-sky-400 via-sky-500 to-blue-600',
  자연: 'from-emerald-400 via-green-500 to-teal-600',
  감성: 'from-pink-300 via-rose-400 to-purple-500',
  맛집: 'from-orange-300 via-amber-400 to-yellow-500',
  문화: 'from-violet-400 via-purple-500 to-indigo-600',
  액티비티: 'from-lime-400 via-sky-400 to-cyan-500',
};

const DEFAULT_GRADIENT = 'from-sky-300 via-sky-400 to-yellow-300';

/** imageUrl이 명시적으로 있거나 firstimage가 있을 때만 실제 이미지 사용 */
export function hasDestinationImage(destination: Destination): boolean {
  return Boolean(destination.imageUrl?.trim() || (destination as any).firstimage?.trim());
}

export function getDestinationImageUrl(destination: Destination): string | null {
  if (destination.imageUrl?.trim()) return destination.imageUrl;
  if ((destination as any).firstimage?.trim()) return (destination as any).firstimage;
  return null;
}

export function getHeroGradient(destination: Destination): string {
  const primaryTheme = destination.themes[0];
  return THEME_GRADIENTS[primaryTheme] ?? DEFAULT_GRADIENT;
}

export function getMapSearchQuery(destination: Destination): string {
  return destination.detail?.mapQuery ?? destination.address ?? destination.title;
}
