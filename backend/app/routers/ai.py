from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.schemas.ai import ScreamCheckResponse, MotionCheckRequest, MotionCheckResponse
from app.ai.scream_detector import scream_detector
from app.ai.anomaly import motion_detector

router = APIRouter(prefix="/ai", tags=["AI Detection"])

@router.post("/scream-check", response_model=ScreamCheckResponse)
async def check_scream(file: UploadFile = File(...)):
    """
    Analyzes an audio sample from device microphone.
    Extracts acoustic features (MFCCs, Spectral Centroid, ZCR, RMS)
    and predicts distress scream probability.
    """
    try:
        audio_bytes = await file.read()
        if not audio_bytes or len(audio_bytes) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio file payload is empty or invalid."
            )

        result = scream_detector.predict(audio_bytes)
        return ScreamCheckResponse(
            is_scream=result["is_scream"],
            confidence=result["confidence"],
            features=result["features"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Audio distress evaluation error: {str(e)}"
        )

@router.post("/motion-check", response_model=MotionCheckResponse)
def check_motion(req: MotionCheckRequest):
    """
    Analyzes rapid accelerometer readings from device motion sensor.
    Calculates rolling Z-scores to identify physical anomalies (violent shake, struggle, impact).
    """
    try:
        readings_dict = [{"x": r.x, "y": r.y, "z": r.z} for r in req.readings]
        result = motion_detector.detect(readings_dict)
        return MotionCheckResponse(
            anomaly=result["anomaly"],
            score=result["score"],
            details=result["details"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Motion anomaly evaluation error: {str(e)}"
        )
