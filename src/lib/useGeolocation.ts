import { useEffect, useRef, useState } from "react";

type Pos = {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  timestamp?: number;
};

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function haversineDistanceMeters(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371000; // meters
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const u = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(u), Math.sqrt(1 - u));
  return R * c;
}

export default function useGeolocation(
  target?: { latitude: number; longitude: number },
  radiusMeters = 100,
  opts?: PositionOptions & { watch?: boolean }
) {
  const [position, setPosition] = useState<Pos | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!(typeof navigator !== "undefined" && navigator.geolocation));
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  const watchId = useRef<number | null>(null);

  const computeDistance = (pos: Pos) => {
    if (!target) return null;
    return haversineDistanceMeters(pos.latitude, pos.longitude, target.latitude, target.longitude);
  };

  const distanceMeters = position ? computeDistance(position) : null;
  const inside = typeof distanceMeters === "number" ? distanceMeters <= radiusMeters : false;

  useEffect(() => {
    if (!navigator?.geolocation) {
      // defer state update to avoid synchronous setState inside effect
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const success = (p: GeolocationPosition) => {
      setPosition({
        latitude: p.coords.latitude,
        longitude: p.coords.longitude,
        accuracy: p.coords.accuracy,
        timestamp: p.timestamp,
      });
      setLoading(false);
    };

    const fail = (e: GeolocationPositionError) => {
      setError(e);
      setLoading(false);
    };

    // if watch option requested, start watching; otherwise just get one position
    if (opts?.watch) {
      const id = navigator.geolocation.watchPosition(success, fail, opts) as unknown as number;
      watchId.current = id;
      return () => {
        if (watchId.current != null) {
          navigator.geolocation.clearWatch(watchId.current as number);
          watchId.current = null;
        }
      };
    }

    navigator.geolocation.getCurrentPosition(success, fail, opts);
  }, [target?.latitude, target?.longitude, opts]);

  const startWatch = (options?: PositionOptions) => {
    if (!navigator?.geolocation || watchId.current != null) return;
    watchId.current = navigator.geolocation.watchPosition(
      (p: GeolocationPosition) => {
        setPosition({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy, timestamp: p.timestamp });
      },
      (e: GeolocationPositionError) => setError(e),
      options ?? opts
    ) as unknown as number;
    setLoading(true);
  };

  const stopWatch = () => {
    if (watchId.current != null && navigator?.geolocation) {
      navigator.geolocation.clearWatch(watchId.current as number);
      watchId.current = null;
    }
    setLoading(false);
  };

  return { position, loading, error, distanceMeters, inside, startWatch, stopWatch };
}
