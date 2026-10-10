import math
from typing import List, Dict, Any

class MotionAnomalyDetector:
    """
    Detects sudden physical distress, violence, falls, or vigorous struggle
    from a stream of 3-axis accelerometer readings using rolling Z-Score statistics.
    """

    def __init__(self, z_threshold: float = 3.0, min_sustained_points: int = 3):
        self.z_threshold = z_threshold
        self.min_sustained_points = min_sustained_points

    def detect(self, readings: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Analyzes a sequence of {x, y, z} accelerometer samples.
        Computes magnitude vector M = sqrt(x^2 + y^2 + z^2), rolling mean, and rolling standard deviation.
        Flags sustained high-deviation Z-scores.
        """
        if not readings or len(readings) < 5:
            return {
                "anomaly": False,
                "score": 0.0,
                "details": {
                    "reason": "Insufficient accelerometer samples (need at least 5)",
                    "samples_count": len(readings) if readings else 0
                }
            }

        # Calculate magnitude of acceleration for each sample
        magnitudes = [math.sqrt(r.get("x", 0)**2 + r.get("y", 0)**2 + r.get("z", 0)**2) for r in readings]

        # Calculate overall mean and standard deviation
        n = len(magnitudes)
        mean_mag = sum(magnitudes) / n
        variance = sum((m - mean_mag) ** 2 for m in magnitudes) / max(n - 1, 1)
        std_mag = math.sqrt(variance)

        # Protect against near-zero std dev (e.g. device completely still on a desk)
        if std_mag < 0.05:
            return {
                "anomaly": False,
                "score": 0.0,
                "details": {
                    "mean_magnitude": round(mean_mag, 3),
                    "std_magnitude": round(std_mag, 3),
                    "sustained_anomalous_points": 0
                }
            }

        # Calculate Z-scores and count sustained anomalies
        z_scores = [(m - mean_mag) / std_mag for m in magnitudes]
        anomalous_points = sum(1 for z in z_scores if abs(z) >= self.z_threshold)
        max_z_score = max(abs(z) for z in z_scores)

        # Check for sustained shock or violent rapid shake (e.g. struggle or shake-to-alert)
        is_anomaly = (
            (anomalous_points >= self.min_sustained_points) or 
            (max_z_score > 4.5 and max(magnitudes) > 25.0)  # Significant sudden impact/shake > 2.5g
        )

        # Normalize score into a bounded confidence 0.0 - 1.0
        normalized_score = min(max_z_score / 6.0, 1.0)

        return {
            "anomaly": bool(is_anomaly),
            "score": round(normalized_score, 4),
            "details": {
                "max_z_score": round(max_z_score, 2),
                "anomalous_points": anomalous_points,
                "mean_magnitude": round(mean_mag, 2),
                "max_magnitude": round(max(magnitudes), 2),
                "threshold": self.z_threshold
            }
        }

motion_detector = MotionAnomalyDetector()
