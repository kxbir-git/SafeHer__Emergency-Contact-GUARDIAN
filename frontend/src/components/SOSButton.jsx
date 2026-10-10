import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

export const SOSButton = ({ onTrigger, isTriggering = false }) => {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const holdStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const HOLD_DURATION = 3000; // 3 seconds

  const handleCancel = useCallback(() => {
    setIsHolding(false);
    setProgress(0);
    holdStartTimeRef.current = null;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const startHold = (e) => {
    e.preventDefault();
    if (isTriggering) return;
    setIsHolding(true);
    holdStartTimeRef.current = performance.now();

    const updateProgress = (now) => {
      if (!holdStartTimeRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      const currentProgress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(currentProgress);

      if (elapsed >= HOLD_DURATION) {
        setIsHolding(false);
        setProgress(0);
        holdStartTimeRef.current = null;
        if (onTrigger) {
          onTrigger();
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // SVG circular ring calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 select-none">
      <div className="relative flex items-center justify-center">
        {/* Circular Progress Ring */}
        <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#DC2626"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-75"
          />
        </svg>

        {/* SOS Hold Button */}
        <button
          type="button"
          onMouseDown={startHold}
          onMouseUp={handleCancel}
          onMouseLeave={handleCancel}
          onTouchStart={startHold}
          onTouchEnd={handleCancel}
          disabled={isTriggering}
          className={`absolute w-32 h-32 rounded-xl flex flex-col items-center justify-center text-white transition-all shadow-subtle ${
            isTriggering
              ? 'bg-[#B91C1C] opacity-80 cursor-wait'
              : isHolding
              ? 'bg-[#B91C1C] scale-95'
              : 'bg-[#DC2626] hover:bg-[#B91C1C] active:scale-95 cursor-pointer'
          }`}
        >
          <ShieldAlert className="w-8 h-8 mb-1" />
          <span className="text-xl font-bold tracking-wider">SOS</span>
          <span className="text-[11px] font-medium tracking-tight opacity-90">
            {isHolding ? `${Math.ceil((HOLD_DURATION - (progress / 100) * HOLD_DURATION) / 1000)}s` : 'HOLD 3s'}
          </span>
        </button>
      </div>

      {/* Progress Information & Cancel Button */}
      <div className="mt-5 text-center min-h-[48px]">
        {isHolding ? (
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs font-semibold text-[#DC2626] tracking-wide uppercase">
              Keep holding to dispatch distress alert...
            </span>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1.5 px-3 py-1 text-xs font-medium border border-[#E5E7EB] bg-white text-[#6B7280] rounded-lg hover:text-[#111827] transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-[#6B7280]">
            Press and hold for 3 seconds to trigger emergency broadcast.
          </p>
        )}
      </div>
    </div>
  );
};
