import { useEffect, useRef, useState, useCallback } from 'react';
import { aiApi } from '../api';

export const useShake = ({ onShakeDetected, enabled = true, sensitivity = 22 }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastShakeTime, setLastShakeTime] = useState(0);
  const readingsBuffer = useRef([]);
  const lastX = useRef(null);
  const lastY = useRef(null);
  const lastZ = useRef(null);

  const triggerShake = useCallback(() => {
    const now = Date.now();
    if (now - lastShakeTime > 4000) { // 4 second cooldown
      setLastShakeTime(now);
      if (onShakeDetected) {
        onShakeDetected({
          readings: readingsBuffer.current.slice(-15),
          timestamp: new Date().toISOString(),
        });
      }
    }
  }, [lastShakeTime, onShakeDetected]);

  useEffect(() => {
    if (!enabled) {
      setIsMonitoring(false);
      return;
    }

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setIsSupported(true);
      setIsMonitoring(true);

      const handleMotion = (event) => {
        const acceleration = event.accelerationIncludingGravity || event.acceleration;
        if (!acceleration) return;

        const x = acceleration.x || 0;
        const y = acceleration.y || 0;
        const z = acceleration.z || 0;

        readingsBuffer.current.push({ x, y, z });
        if (readingsBuffer.current.length > 30) {
          readingsBuffer.current.shift();
        }

        if (lastX.current !== null) {
          const deltaX = Math.abs(x - lastX.current);
          const deltaY = Math.abs(y - lastY.current);
          const deltaZ = Math.abs(z - lastZ.current);
          const totalDelta = deltaX + deltaY + deltaZ;

          if (totalDelta > sensitivity) {
            // Verify with backend motion anomaly check periodically or trigger immediately
            triggerShake();
          }
        }

        lastX.current = x;
        lastY.current = y;
        lastZ.current = z;
      };

      window.addEventListener('devicemotion', handleMotion);
      return () => {
        window.removeEventListener('devicemotion', handleMotion);
      };
    } else {
      setIsSupported(false);
    }
  }, [enabled, sensitivity, triggerShake]);

  return { isSupported, isMonitoring, triggerSimulatedShake: triggerShake };
};
