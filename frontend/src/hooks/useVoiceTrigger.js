import { useEffect, useRef, useState, useCallback } from 'react';
import { aiApi } from '../api';

export const useVoiceTrigger = ({
  onVoiceTriggered,
  onScreamDetected,
  voiceEnabled = false,
  screamCheckEnabled = false,
}) => {
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [isListeningScream, setIsListeningScream] = useState(false);
  const [screamScore, setScreamScore] = useState(0.0);
  const [lastDetectedKeyword, setLastDetectedKeyword] = useState('');

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const screamIntervalRef = useRef(null);

  // 1. Keyword Recognition ("help me" / "bachao" / "save me")
  useEffect(() => {
    if (!voiceEnabled) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      setIsListeningVoice(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Works for Indian English and transliterated phrases

    recognition.onstart = () => {
      setIsListeningVoice(true);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (
          transcript.includes('help me') ||
          transcript.includes('bachao') ||
          transcript.includes('save me') ||
          transcript.includes('emergency')
        ) {
          setLastDetectedKeyword(transcript.trim());
          if (onVoiceTriggered) {
            onVoiceTriggered(transcript.trim());
          }
        }
      }
    };

    recognition.onerror = (e) => {
      if (e.error !== 'no-speech') {
        console.warn('Speech recognition error:', e.error);
      }
    };

    recognition.onend = () => {
      // Auto restart if still enabled
      if (voiceEnabled) {
        try {
          recognition.start();
        } catch (_) {}
      } else {
        setIsListeningVoice(false);
      }
    };

    try {
      recognition.start();
    } catch (_) {}

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [voiceEnabled, onVoiceTriggered]);

  // 2. Audio Scream Detection loop (recording 2.5s chunk and sending to /api/ai/scream-check)
  const processAudioChunk = useCallback(async (blob) => {
    try {
      const result = await aiApi.checkScream(blob);
      setScreamScore(result.confidence);
      if (result.is_scream && result.confidence >= 0.65) {
        if (onScreamDetected) {
          onScreamDetected(result);
        }
      }
    } catch (err) {
      // Ignore background audio poll errors
    }
  }, [onScreamDetected]);

  useEffect(() => {
    if (!screamCheckEnabled) {
      if (screamIntervalRef.current) clearInterval(screamIntervalRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsListeningScream(false);
      return;
    }

    let isSubscribed = true;

    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        if (!isSubscribed) return;
        audioStreamRef.current = stream;
        setIsListeningScream(true);

        // Record chunks every 3 seconds
        const recordSample = () => {
          if (!stream.active) return;
          const recorder = new MediaRecorder(stream);
          const chunks = [];

          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/wav' });
            processAudioChunk(blob);
          };

          recorder.start();
          setTimeout(() => {
            if (recorder.state === 'recording') recorder.stop();
          }, 2000);
        };

        recordSample();
        screamIntervalRef.current = setInterval(recordSample, 4000);
      })
      .catch((err) => {
        console.warn('Microphone access denied or unavailable:', err);
        setIsListeningScream(false);
      });

    return () => {
      isSubscribed = false;
      if (screamIntervalRef.current) clearInterval(screamIntervalRef.current);
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [screamCheckEnabled, processAudioChunk]);

  return {
    isListeningVoice,
    isListeningScream,
    screamScore,
    lastDetectedKeyword,
  };
};
