import { ChevronRight, RotateCcw } from "lucide-react";

/**
 * 카드 아래 액션 바 — Adventure 톤.
 */
export function CardActionBar({
  onRedraw,
  disabled = false,
}: {
  onRedraw: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto mt-6 max-w-xl">
      <button
        type="button"
        onClick={onRedraw}
        disabled={disabled}
        aria-disabled={disabled}
        className="expedition-panel flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-brass/45 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-brass/30 bg-[var(--color-parchment-100)] text-brass shadow-sm"
          aria-hidden="true"
        >
          <RotateCcw className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <span className="flex-1">
          <span className="font-expedition block text-base font-bold text-ink">카드 다시 뽑기</span>
          <span className="block text-sm text-muted">새로운 5장의 탐험 신호를 다시 만나보세요</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-brass" strokeWidth={2.2} aria-hidden="true" />
      </button>
    </div>
  );
}
