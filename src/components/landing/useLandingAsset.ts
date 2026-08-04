import { useEffect, useState } from "react";

export type AssetLoadState = "idle" | "loading" | "ready" | "error";

/**
 * Preload an optional landing asset. Never leaves a broken <img> visible:
 * - missing / failed → ready=false (caller shows CSS fallback)
 * - success → ready=true (caller may show <img>, still with onError reset)
 */
export function useLandingAsset(src: string): {
  ready: boolean;
  state: AssetLoadState;
  fail: () => void;
} {
  const [state, setState] = useState<AssetLoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    const img = new Image();
    img.onload = () => {
      if (!cancelled) setState("ready");
    };
    img.onerror = () => {
      if (!cancelled) setState("error");
    };
    img.src = src;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return {
    ready: state === "ready",
    state,
    fail: () => setState("error"),
  };
}
