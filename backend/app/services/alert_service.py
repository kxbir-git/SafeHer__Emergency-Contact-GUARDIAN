import datetime
import logging
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.user import User
from app.models.contact import EmergencyContact
from app.services.socket_manager import socket_manager
from app.services.sms_service import sms_service

logger = logging.getLogger("safeher.alerts")

class AlertService:
    """Coordinates real-time multi-channel safety alerts across WebSockets, SMS, and Push."""

    @staticmethod
    async def dispatch_alert(db: Session, alert: Alert, user: User, meta: dict = None) -> dict:
        # 1. Fetch user emergency contacts
        contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == user.id).all()
        
        # 2. Prepare payload
        map_link = f"https://www.openstreetmap.org/?mlat={alert.lat}&mlon={alert.lng}#map=17/{alert.lat}/{alert.lng}"
        alert_payload = {
            "id": alert.id,
            "user_id": user.id,
            "user_name": user.full_name,
            "user_phone": user.phone,
            "blood_group": user.blood_group,
            "type": alert.type,
            "lat": alert.lat,
            "lng": alert.lng,
            "status": alert.status,
            "confidence": alert.confidence,
            "created_at": alert.created_at.isoformat(),
            "map_link": map_link,
            "meta": meta or {}
        }

        # 3. Broadcast real-time event to all connected Guardians/Clients
        await socket_manager.broadcast({
            "event": "alert_triggered",
            "data": alert_payload
        })

        # 4. Dispatch SMS alerts to emergency contacts
        sms_results = []
        sms_body = (
            f"[EMERGENCY ALERT - SafeHer]\n"
            f"{user.full_name} triggered a {alert.type.upper()} distress alert!\n"
            f"Location: https://maps.google.com/?q={alert.lat},{alert.lng}\n"
            f"Status: Immediate response requested.\n"
            f"Time: {alert.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}"
        )

        for contact in contacts:
            if contact.phone:
                res = sms_service.send_sms(contact.phone, sms_body)
                sms_results.append({"contact_name": contact.name, "phone": contact.phone, "res": res})

        logger.info(f"Dispatched alert #{alert.id} for user {user.full_name} to {len(contacts)} contacts.")
        return {
            "alert": alert_payload,
            "dispatched_sms_count": len(sms_results),
            "contacts_notified": [c.name for c in contacts]
        }

alert_service = AlertService()
