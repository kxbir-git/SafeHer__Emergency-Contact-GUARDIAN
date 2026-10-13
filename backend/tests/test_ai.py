import io
import wave
import struct
import pytest

def generate_dummy_wav(duration_sec=0.5, freq=440.0, sample_rate=22050):
    """Generates simple PCM WAV audio bytes for testing audio distress pipeline."""
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        n_frames = int(duration_sec * sample_rate)
        # Write quiet sine wave
        import math
        frames = bytearray()
        for i in range(n_frames):
            val = int(32767.0 * 0.1 * math.sin(2.0 * math.pi * freq * (i / sample_rate)))
            frames.extend(struct.pack("<h", val))
        wf.writeframes(frames)
    return buffer.getvalue()

def test_scream_check_valid_audio(client):
    wav_bytes = generate_dummy_wav()
    files = {"file": ("test.wav", wav_bytes, "audio/wav")}
    response = client.post("/api/ai/scream-check", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "is_scream" in data
    assert "confidence" in data
    assert "features" in data
    assert isinstance(data["confidence"], float)

def test_scream_check_empty_payload(client):
    files = {"file": ("empty.wav", b"", "audio/wav")}
    response = client.post("/api/ai/scream-check", files=files)
    assert response.status_code == 400

def test_motion_check_normal(client):
    # Calm / still device readings
    readings = [{"x": 0.05, "y": 0.02, "z": 9.8} for _ in range(10)]
    response = client.post("/api/ai/motion-check", json={"readings": readings})
    assert response.status_code == 200
    data = response.json()
    assert data["anomaly"] is False
    assert data["score"] == 0.0

def test_motion_check_anomalous_shock(client):
    # Normal baseline readings followed by violent spikes
    readings = [{"x": 0.1, "y": 0.1, "z": 9.8} for _ in range(10)]
    # Violent shock / struggle spikes (z-score > 4.5 and magnitude > 25.0)
    for _ in range(5):
        readings.append({"x": 22.0, "y": 28.0, "z": 30.0})
    response = client.post("/api/ai/motion-check", json={"readings": readings})
    assert response.status_code == 200
    data = response.json()
    assert data["anomaly"] is True
    assert data["score"] > 0
