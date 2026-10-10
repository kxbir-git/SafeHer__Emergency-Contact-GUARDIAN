import os
import datetime
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.user import User
from app.models.contact import EmergencyContact
from app.models.incident import Incident
from app.models.location import Location
from app.models.alert import Alert
from app.utils.security import get_password_hash

def run_seed():
    """Seeds the database with realistic demo user, contacts, incidents, location, and past alerts."""
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.email == "demo@safeher.app").first()
        if existing_user:
            print("Demo user already exists. Cleaning up existing demo data for clean re-seed...")
            db.query(Alert).filter(Alert.user_id == existing_user.id).delete()
            db.query(EmergencyContact).filter(EmergencyContact.user_id == existing_user.id).delete()
            db.query(Location).filter(Location.user_id == existing_user.id).delete()
            db.query(Incident).delete()
            db.delete(existing_user)
            db.commit()

        print("Creating demo user (demo@safeher.app)...")
        demo_user = User(
            email="demo@safeher.app",
            hashed_password=get_password_hash("demo1234"),
            full_name="Aanya Sharma",
            phone="+91 98765 43210",
            blood_group="O+",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=30)
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)

        print("Creating 3 emergency contacts...")
        contacts = [
            EmergencyContact(
                user_id=demo_user.id,
                name="Sunita Sharma",
                phone="+91 98111 22334",
                email="sunita.sharma@example.com",
                relation="Mother",
                is_guardian=True
            ),
            EmergencyContact(
                user_id=demo_user.id,
                name="Rohan Sharma",
                phone="+91 98222 33445",
                email="rohan.sharma@example.com",
                relation="Brother",
                is_guardian=True
            ),
            EmergencyContact(
                user_id=demo_user.id,
                name="Pooja Verma",
                phone="+91 98333 44556",
                email="pooja.verma@example.com",
                relation="Colleague",
                is_guardian=False
            )
        ]
        db.add_all(contacts)

        print("Creating current user live location (Connaught Place, New Delhi)...")
        user_location = Location(
            user_id=demo_user.id,
            lat=28.6328,
            lng=77.2197,
            updated_at=datetime.datetime.utcnow()
        )
        db.add(user_location)

        print("Creating 5 realistic incident reports...")
        sample_incidents = [
            Incident(
                user_id=demo_user.id,
                lat=28.6289,
                lng=77.2065,
                category="Poor Lighting",
                severity="Medium",
                description="Streetlights completely dysfunctional along the pedestrian underpass. Very dark after 8 PM.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
            ),
            Incident(
                user_id=demo_user.id,
                lat=28.6385,
                lng=77.2150,
                category="Harassment",
                severity="High",
                description="Group of men catcalling and passing inappropriate comments near the metro gate auto stand.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
            ),
            Incident(
                user_id=demo_user.id,
                lat=28.6420,
                lng=77.2280,
                category="Suspicious Activity",
                severity="Medium",
                description="Unregistered motorcycle riders following lone commuters and loitering continuously in the dark alley.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=7)
            ),
            Incident(
                user_id=demo_user.id,
                lat=28.6250,
                lng=77.2340,
                category="Stalking",
                severity="Critical",
                description="Reported silver car tailgating a woman walking towards metro; local PCR van was alerted.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=12)
            ),
            Incident(
                user_id=demo_user.id,
                lat=28.6180,
                lng=77.2100,
                category="Poor Lighting",
                severity="Low",
                description="Dimly lit alleyway with broken pavement and zero active CCTV surveillance.",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15)
            )
        ]
        db.add_all(sample_incidents)

        print("Creating historical sample alerts...")
        sample_alerts = [
            Alert(
                user_id=demo_user.id,
                type="scream",
                lat=28.6340,
                lng=77.2210,
                status="resolved",
                confidence=0.92,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3, hours=4),
                acknowledged_at=datetime.datetime.utcnow() - datetime.timedelta(days=3, hours=3, minutes=58),
                resolved_at=datetime.datetime.utcnow() - datetime.timedelta(days=3, hours=3, minutes=45)
            ),
            Alert(
                user_id=demo_user.id,
                type="sos",
                lat=28.6315,
                lng=77.2185,
                status="acknowledged",
                confidence=1.0,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=14),
                acknowledged_at=datetime.datetime.utcnow() - datetime.timedelta(hours=13, minutes=55)
            )
        ]
        db.add_all(sample_alerts)

        db.commit()
        print("\nSeed successfully completed!")
        print("Demo Account:")
        print("  Email: demo@safeher.app")
        print("  Password: demo1234")
        print("  Contacts: 3 contacts seeded (2 guardians)")
        print("  Incidents: 5 incident reports seeded around Connaught Place, New Delhi")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
