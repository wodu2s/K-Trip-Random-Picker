import { useCallback, useEffect, useRef, useState } from "react";

export type GeoStatus = "idle" | "loading" | "success" | "error";

export type GeoErrorKind = "unsupported" | "denied" | "unavailable" | "timeout" | "unknown";

export type GeoState = {
  status: GeoStatus;
  latitude: number | null;
  longitude: number | null;
  error: GeoErrorKind | null;
};

const GEO_TIMEOUT_MS = 8000;

function mapGeoError(err: GeolocationPositionError | null, unsupported: boolean): GeoErrorKind {
  if (unsupported) return "unsupported";
  if (!err) return "unknown";
  if (err.code === err.PERMISSION_DENIED) return "denied";
  if (err.code === err.POSITION_UNAVAILABLE) return "unavailable";
  if (err.code === err.TIMEOUT) return "timeout";
  return "unknown";
}

/**
 * Browser Geolocation. 권한 거부·미지원이어도 앱을 중단하지 않는다.
 * 좌표는 추천 시 locationBasedList2 보강에만 쓰인다.
 */
export function useGeolocation(requestOnMount = true): GeoState & { requestPosition: () => void } {
  const [state, setState] = useState<GeoState>({
    status: "idle",
    latitude: null,
    longitude: null,
    error: null,
  });
  const asked = useRef(false);

  const requestPosition = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({
        status: "error",
        latitude: null,
        longitude: null,
        error: "unsupported",
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "loading",
      error: null,
    }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: "success",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          error: null,
        });
      },
      (err) => {
        setState({
          status: "error",
          latitude: null,
          longitude: null,
          error: mapGeoError(err, false),
        });
      },
      {
        enableHighAccuracy: false,
        timeout: GEO_TIMEOUT_MS,
        maximumAge: 60_000,
      },
    );
  }, []);

  useEffect(() => {
    if (!requestOnMount || asked.current) return;
    asked.current = true;
    requestPosition();
  }, [requestOnMount, requestPosition]);

  return { ...state, requestPosition };
}
