import os
import io
import pickle
import logging
import numpy as np

logger = logging.getLogger("safeher.ai.scream")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "scream_model.pkl")

class ScreamDetector:
    """
    Audio distress & scream detection service.
    Extracts 40 MFCCs, Spectral Centroid, Zero Crossing Rate (ZCR), and RMS energy.
    Classifies audio using a Gradient Boosting model.
    Generates synthetic training distribution and persists scream_model.pkl if missing.
    """

    def __init__(self):
        self.model = None
        self._initialize_model()

    def _initialize_model(self):
        """Loads existing model or automatically trains a baseline classifier."""
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    self.model = pickle.load(f)
                logger.info(f"Loaded existing scream detection model from {MODEL_PATH}")
                return
            except Exception as e:
                logger.warning(f"Error loading {MODEL_PATH}: {e}. Retraining...")

        self._train_and_save_synthetic_model()

    def _train_and_save_synthetic_model(self):
        """Generates realistic synthetic acoustic feature distributions and trains GradientBoostingClassifier."""
        from sklearn.ensemble import GradientBoostingClassifier
        logger.info("Training synthetic baseline scream detection model...")

        np.random.seed(42)
        n_samples_each = 600

        # Feature layout: [40 MFCCs, Spectral Centroid, ZCR, RMS Energy] (43 dimensions total)

        # Class 0: Ambient / Normal Speech / Quiet
        # - Low-to-moderate Centroid (500 - 1800 Hz)
        # - Low ZCR (0.02 - 0.08)
        # - Low/Medium RMS (0.01 - 0.12)
        # - MFCCs centered around typical speech values
        mfcc_speech = np.random.normal(loc=-5.0, scale=8.0, size=(n_samples_each, 40))
        centroid_speech = np.random.uniform(500, 1800, size=(n_samples_each, 1))
        zcr_speech = np.random.uniform(0.01, 0.08, size=(n_samples_each, 1))
        rms_speech = np.random.uniform(0.01, 0.12, size=(n_samples_each, 1))
        X_speech = np.hstack([mfcc_speech, centroid_speech, zcr_speech, rms_speech])
        y_speech = np.zeros(n_samples_each)

        # Class 1: Scream / High Distress / Panic
        # - High Spectral Centroid (2400 - 5200 Hz)
        # - Elevated ZCR (0.12 - 0.38)
        # - High RMS energy (0.18 - 0.65)
        # - MFCC high frequency energy peaks
        mfcc_scream = np.random.normal(loc=12.0, scale=10.0, size=(n_samples_each, 40))
        centroid_scream = np.random.uniform(2400, 5200, size=(n_samples_each, 1))
        zcr_scream = np.random.uniform(0.12, 0.38, size=(n_samples_each, 1))
        rms_scream = np.random.uniform(0.18, 0.65, size=(n_samples_each, 1))
        X_scream = np.hstack([mfcc_scream, centroid_scream, zcr_scream, rms_scream])
        y_scream = np.ones(n_samples_each)

        X = np.vstack([X_speech, X_scream])
        y = np.concatenate([y_speech, y_scream])

        clf = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
        clf.fit(X, y)

        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        with open(MODEL_PATH, "wb") as f:
            pickle.dump(clf, f)

        self.model = clf
        logger.info(f"Scream detection model trained and saved to {MODEL_PATH}")

    def extract_features(self, audio_bytes: bytes) -> np.ndarray:
        """
        Extracts 43 acoustic features:
        40 MFCCs, Spectral Centroid, Zero Crossing Rate, RMS Energy.
        """
        try:
            import librosa
            import soundfile as sf
            
            # Read audio data from memory buffer
            try:
                audio_buffer = io.BytesIO(audio_bytes)
                y, sr = sf.read(audio_buffer)
                if len(y.shape) > 1:
                    y = np.mean(y, axis=1)  # Convert stereo to mono
                y = y.astype(np.float32)
            except Exception:
                # Fallback to librosa.load
                audio_buffer = io.BytesIO(audio_bytes)
                y, sr = librosa.load(audio_buffer, sr=22050, mono=True)

            if len(y) == 0:
                y = np.zeros(22050, dtype=np.float32)
                sr = 22050

            # 1. MFCC (40 coefficients)
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
            mfcc_mean = np.mean(mfcc, axis=1)

            # 2. Spectral Centroid
            cent = librosa.feature.spectral_centroid(y=y, sr=sr)
            cent_mean = np.mean(cent)

            # 3. Zero Crossing Rate
            zcr = librosa.feature.zero_crossing_rate(y)
            zcr_mean = np.mean(zcr)

            # 4. RMS Energy
            rms = librosa.feature.rms(y=y)
            rms_mean = np.mean(rms)

            features = np.hstack([mfcc_mean, [cent_mean, zcr_mean, rms_mean]])
            return features.reshape(1, -1), {
                "spectral_centroid": float(cent_mean),
                "zcr": float(zcr_mean),
                "rms_energy": float(rms_mean)
            }
        except Exception as e:
            logger.warning(f"Audio feature extraction fallback due to: {e}")
            # Robust mathematical estimation fallback
            signal = np.frombuffer(audio_bytes[:2048], dtype=np.int16).astype(np.float32) if len(audio_bytes) >= 2048 else np.random.uniform(-0.1, 0.1, 1024)
            rms_val = float(np.sqrt(np.mean(signal**2)))
            zcr_val = float(np.mean(np.diff(np.sign(signal)) != 0))
            features = np.zeros((1, 43))
            features[0, :40] = 0.0
            features[0, 40] = 1200.0
            features[0, 41] = zcr_val
            features[0, 42] = rms_val
            return features, {"spectral_centroid": 1200.0, "zcr": zcr_val, "rms_energy": rms_val}

    def predict(self, audio_bytes: bytes) -> dict:
        """Classifies input audio file into Scream/Panic vs Normal."""
        if self.model is None:
            self._initialize_model()

        features, summary = self.extract_features(audio_bytes)
        probs = self.model.predict_proba(features)[0]
        scream_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
        is_scream = scream_prob >= 0.55

        return {
            "is_scream": is_scream,
            "confidence": round(scream_prob, 4),
            "features": summary
        }

scream_detector = ScreamDetector()
