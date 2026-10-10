import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, User, Clock, X, Volume2 } from 'lucide-react';

export const FakeCallModal = ({ isOpen, onClose }) => {
  const [callerName, setCallerName] = useState('Mom');
  const [delaySeconds, setDelaySeconds] = useState(0); // 0 = immediate
  const [countdown, setCountdown] = useState(null);
  const [callState, setCallState] = useState('config'); // 'config', 'waiting', 'ringing', 'connected'
  const [callDuration, setCallDuration] = useState(0);

  const timerRef = useRef(null);
  const callDurationRef = useRef(null);
  const audioContextRef = useRef(null);

  // Play realistic synthesized ringtone beep using Web Audio API
  const playRingTone = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        try { osc.stop(); } catch (_) {}
      }, 1500);
    } catch (_) {}
  };

  const handleStartFakeCall = () => {
    if (delaySeconds === 0) {
      setCallState('ringing');
      playRingTone();
    } else {
      setCallState('waiting');
      setCountdown(delaySeconds);
    }
  };

  // Countdown timer for scheduled call
  useEffect(() => {
    if (callState === 'waiting' && countdown !== null) {
      if (countdown > 0) {
        timerRef.current = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        setCallState('ringing');
        playRingTone();
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [callState, countdown]);

  // Call duration counter during connected call
  useEffect(() => {
    if (callState === 'connected') {
      callDurationRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      if (callDurationRef.current) clearInterval(callDurationRef.current);
    }
    return () => {
      if (callDurationRef.current) clearInterval(callDurationRef.current);
    };
  }, [callState]);

  const handleAcceptCall = () => {
    setCallState('connected');
  };

  const handleEndCall = () => {
    setCallState('config');
    setCountdown(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      {/* 1. Configuration Screen */}
      {callState === 'config' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-sm p-6 shadow-modal">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-[#DC2626]" />
              <h3 className="text-base font-semibold text-[#111827]">Schedule Fake Call</h3>
            </div>
            <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#111827]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
                Simulated Caller Name
              </label>
              <select
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                className="w-full text-xs border border-[#E5E7EB] rounded-lg p-2.5 bg-white text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                <option value="Mom">Mom (Sunita)</option>
                <option value="Dad">Dad</option>
                <option value="Brother (Rohan)">Brother (Rohan)</option>
                <option value="Police Helpline 112">Police Helpline 112</option>
                <option value="Boss / Manager">Office Manager</option>
                <option value="Cab Driver">Cab Driver</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
                Trigger Timing Delay
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Now', val: 0 },
                  { label: '15 sec', val: 15 },
                  { label: '30 sec', val: 30 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setDelaySeconds(item.val)}
                    className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                      delaySeconds === item.val
                        ? 'border-[#111827] bg-[#111827] text-white'
                        : 'border-[#E5E7EB] bg-[#FAFAFA] text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
              Use this tool when feeling uncomfortable or followed. An authentic incoming phone call simulation will trigger.
            </p>

            <button
              onClick={handleStartFakeCall}
              className="w-full py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Start Fake Call
            </button>
          </div>
        </div>
      )}

      {/* 2. Waiting Countdown Banner */}
      {callState === 'waiting' && (
        <div className="bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-sm p-6 text-center shadow-modal">
          <Clock className="w-8 h-8 text-[#6B7280] mx-auto mb-2 animate-pulse" />
          <h3 className="text-base font-semibold text-[#111827]">Call Armed</h3>
          <p className="text-xs text-[#6B7280] mt-1">
            Simulated call from <span className="font-semibold text-[#111827]">{callerName}</span> in:
          </p>
          <div className="text-3xl font-bold font-mono text-[#DC2626] my-4">{countdown}s</div>
          <button
            onClick={handleEndCall}
            className="w-full py-2 text-xs font-medium border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:text-[#111827]"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 3. Ringing Incoming Screen */}
      {callState === 'ringing' && (
        <div className="bg-[#111827] text-white rounded-3xl w-full max-w-xs p-8 flex flex-col items-center justify-between min-h-[480px] shadow-2xl">
          <div className="text-center mt-6">
            <div className="w-20 h-20 rounded-full bg-[#1F2937] border-2 border-gray-600 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{callerName}</h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Incoming Call...</p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>Ringing...</span>
          </div>

          <div className="w-full flex items-center justify-around mt-8">
            <button
              onClick={handleEndCall}
              className="flex flex-col items-center space-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors">
                <PhoneOff className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Decline</span>
            </button>

            <button
              onClick={handleAcceptCall}
              className="flex flex-col items-center space-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-700 transition-colors">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Accept</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Connected Call Screen */}
      {callState === 'connected' && (
        <div className="bg-[#111827] text-white rounded-3xl w-full max-w-xs p-8 flex flex-col items-center justify-between min-h-[480px] shadow-2xl">
          <div className="text-center mt-6">
            <div className="w-20 h-20 rounded-full bg-[#1F2937] border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{callerName}</h2>
            <p className="text-xs text-emerald-400 font-mono mt-1">
              00:{callDuration < 10 ? `0${callDuration}` : callDuration}
            </p>
          </div>

          <div className="p-3 bg-[#1F2937] rounded-xl text-xs text-gray-300 text-center leading-relaxed">
            "Hey, where are you right now? I'm waiting right outside for you, come quickly."
          </div>

          <div className="w-full flex justify-center mt-6">
            <button
              onClick={handleEndCall}
              className="flex flex-col items-center space-y-1"
            >
              <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors">
                <PhoneOff className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] text-gray-400 font-medium">End Call</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
