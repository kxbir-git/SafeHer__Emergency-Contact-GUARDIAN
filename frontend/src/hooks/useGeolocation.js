import { useState, useEffect } from 'react';
import { locationsApi } from '../api';

export const useGeolocation = (autoSync = true) => {
  const [coords, setCoords] = useState({
    // Default to New Delhi (Connaught Place) if geolocation not permitted or pending
    lat: 28.6328,
    lng: 77.2197,
    accuracy: null,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    const successHandler = (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      setCoords({ lat: latitude, lng: longitude, accuracy });
      setLoading(false);

      if (autoSync && localStorage.getItem('safeher_token')) {
        locationsApi.update(latitude, longitude).catch(() => {});
      }
    };

    const errorHandler = (err) => {
      setError(err.message);
      setLoading(false);
    };

    // Get current position immediately
    navigator.geolocation.getCurrentPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });

    // Watch position updates
    const watcherId = navigator.geolocation.watchPosition(successHandler, errorHandler, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    });

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, [autoSync]);

  return { coords, error, loading };
};
