import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger("safeher.sms")

class SMSService:
    """Twilio SMS service with automated mock fallback if credentials are unset or invalid."""
    def __init__(self):
        self.client = None
        if settings.TWILIO_SID and settings.TWILIO_TOKEN:
            try:
                from twilio.rest import Client
                self.client = Client(settings.TWILIO_SID, settings.TWILIO_TOKEN)
                logger.info("Twilio SMS Client initialized successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize Twilio client ({e}). Running in MOCK mode.")
                self.client = None
        else:
            logger.info("Twilio credentials not configured. Running in MOCK mode.")

    def send_sms(self, to_phone: str, message: str) -> dict:
        """Sends SMS via Twilio or logs mock transmission."""
        if self.client and settings.TWILIO_FROM:
            try:
                msg = self.client.messages.create(
                    body=message,
                    from_=settings.TWILIO_FROM,
                    to=to_phone
                )
                logger.info(f"Twilio SMS sent successfully to {to_phone}. SID: {msg.sid}")
                return {"success": True, "mode": "twilio", "sid": msg.sid}
            except Exception as e:
                logger.error(f"Failed to send Twilio SMS to {to_phone}: {e}. Falling back to mock log.")
        
        # MOCK Fallback
        print("\n" + "="*60)
        print(f"[MOCK SMS DISPATCH - TWILIO SIMULATION]")
        print(f"Recipient : {to_phone}")
        print(f"Content   :\n{message}")
        print("="*60 + "\n")
        logger.info(f"[MOCK SMS] Dispatched to {to_phone}: {message[:60]}...")
        return {"success": True, "mode": "mock", "recipient": to_phone}

sms_service = SMSService()
