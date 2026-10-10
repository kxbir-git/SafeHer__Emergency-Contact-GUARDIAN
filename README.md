# SafeHer — AI-Based Women's Safety App with Real-Time Alert System

SafeHer is a comprehensive, production-grade personal safety and emergency response web application designed for women. It combines real-time multi-channel dispatch, offline-capable AI distress classification, live GPS route telemetry, and escape tools into a unified, calm, and restrained interface.

---

## 1. System Architecture

```
SafeHer Platform
├── Frontend (React 18 + Vite + Tailwind CSS + Leaflet + Zustand)
│   ├── SOS Engine (3-second circular progress hold to prevent accidental triggers)
│   ├── Live OpenStreetMap Telemetry (Leaflet GPS tracking, ward & alert markers)
│   ├── AI Sensory Hooks (useVoiceTrigger for keywords, useShake for DeviceMotion)
│   ├── Safe Route & Incident Map (Crowdsourced hazard reporting & safety index)
│   └── Escape Simulator (Authentic scheduled fake incoming call)
│
├── Backend (FastAPI + Python 3.11 + SQLAlchemy + WebSockets + Pydantic v2)
│   ├── /api/auth & /api/users (JWT authentication & emergency profiles)
│   ├── /api/alerts (Multi-channel dispatch: WebSockets + Twilio SMS)
│   ├── /api/locations (Live location streaming & guardian tracking)
│   ├── /api/incidents (Geographic hazard reporting & proximity queries)
│   └── /ws/alerts (Real-time bi-directional WebSocket broadcast channel)
│
└── AI & Machine Learning Pipeline
    ├── Acoustic Distress Classifier (librosa feature extraction: 40 MFCCs, Spectral Centroid, ZCR, RMS)
    ├── Scikit-Learn GradientBoostingClassifier (Pre-trained / self-generating offline model)
    └── Motion Anomaly Detector (Rolling Z-score statistics on 3-axis accelerometer readings)
```

---

## 2. Key Features

1. **SOS 3-Second Hold Button**: Circular SVG progress ring fills over 3 seconds to prevent accidental taps. Can be cancelled mid-press.
2. **Real-Time WebSocket & SMS Dispatch**: Dispatches instantaneous alerts with GPS links to all online guardians and emergency contacts via Twilio SMS (automated mock mode if API credentials are not provided).
3. **AI Scream & Acoustic Distress Detection**: Microphone listens in the background, extracts acoustic features, and classifies distress screams vs. ambient noise using a saved Gradient Boosting model.
4. **Shake-to-Alert**: Detects rapid shake motion via the `DeviceMotionEvent` API and verifies physical shock anomalies via backend rolling Z-scores ($Z > 3.0$).
5. **Voice Keyword Trigger**: Continuous speech recognition for distress keywords (`"help me"`, `"bachao"`, `"emergency"`).
6. **Safe Route Evaluator**: Users input destination addresses; the app calculates an area safety score based on historical incident density and recommends well-lit, monitored corridors.
7. **Escape Fake Call**: Authentic simulated incoming call with synthesized ringtone, customizable delay, caller presets ("Mom", "Police 112"), and active call screen.
8. **Nearby Emergency Help**: Free OpenStreetMap layer displaying seeded local police stations, hospitals, and 24/7 pharmacies with 1-click dial.
9. **Crowdsourced Incident Reports**: Citizens report poor lighting, harassment, or stalking incidents, directly influencing the local route safety score.
10. **Guardian Oversight Feed**: Guardians can monitor ward telemetry, view distress confidence meters, acknowledge alarms, and mark incidents resolved.

---

## 3. Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS (config-based, no CDN), React Router v6, Axios, Leaflet, React-Leaflet, Zustand, Lucide-React.
- **Backend**: Python 3.11, FastAPI, Uvicorn, SQLAlchemy ORM, SQLite (switchable to PostgreSQL via `DATABASE_URL`), Pydantic v2, Python-Jose (JWT), Passlib (Bcrypt), WebSockets, Twilio SDK.
- **AI/ML**: Librosa, SoundFile, NumPy, Scikit-Learn.

---

## 4. Getting Started & Installation

### Prerequisites
- Python 3.11 (`py -3.11` or `python`)
- Node.js v18+ and npm

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd safeher/backend
   ```

2. Create a virtual environment and activate it:
   - **Windows**:
     ```powershell
     py -3.11 -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS**:
     ```bash
     python3.11 -m venv venv
     source venv/bin/activate
     ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt --prefer-binary
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Note: Twilio credentials can be left blank — the system automatically logs mock SMS dispatches to stdout in development mode).*

5. Seed the database with realistic demo data:
   ```bash
   python seed.py
   ```
   *This seeds a demo user account, 3 emergency contacts, and 5 realistic geographic incidents around New Delhi.*

6. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The API will be live at `http://127.0.0.1:8000` (Swagger docs: `http://127.0.0.1:8000/docs`).

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd safeher/frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The web application will open at `http://localhost:5173`.

---

## 5. Demo Credentials

You can sign in with the pre-seeded account or click **"Fill Demo Account"** on the login page:

- **Email**: `demo@safeher.app`
- **Password**: `demo1234`
- **Pre-seeded Contacts**: Sunita Sharma (Mother, Guardian), Rohan Sharma (Brother, Guardian), Pooja Verma (Colleague)

---

## 6. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account and receive JWT token |
| `POST` | `/api/auth/login` | Authenticate user credentials and return JWT |
| `GET` | `/api/users/me` | Fetch authenticated user profile & contacts |
| `PUT` | `/api/users/me` | Update full name, phone number, or blood group |
| `GET` | `/api/contacts` | List user emergency contacts |
| `POST` | `/api/contacts` | Add emergency contact (max 5) |
| `DELETE` | `/api/contacts/{id}` | Remove emergency contact |
| `POST` | `/api/alerts/trigger` | Trigger SOS / scream / shake / voice alert |
| `GET` | `/api/alerts/history` | List past alert history and resolution times |
| `POST` | `/api/alerts/{id}/acknowledge` | Mark an alert acknowledged by responder |
| `POST` | `/api/alerts/{id}/resolve` | Mark an alert safely resolved |
| `POST` | `/api/ai/scream-check` | Classify multipart audio sample for distress scream |
| `POST` | `/api/ai/motion-check` | Check accelerometer buffer for physical anomaly |
| `POST` | `/api/locations/update` | Update user GPS coordinates |
| `GET` | `/api/locations/{user_id}/live` | Fetch user live coordinates |
| `GET` | `/api/incidents/nearby` | Query nearby hazard reports by lat, lng & radius |
| `POST` | `/api/incidents/report` | Submit crowdsourced safety incident |
| `WS` | `/ws/alerts` | Real-time WebSocket event subscription channel |

---

## 7. UI Design System

SafeHer adheres strictly to a clean, human-designed aesthetic inspired by Linear, Stripe, and Vercel:
- **Theme**: Pure White (`#FFFFFF`) with subtle gray cards (`#FAFAFA`).
- **Accent**: Emergency Deep Red (`#DC2626`).
- **Typography**: Inter (Google Fonts) with strict 8/12/16/24/32px spacing hierarchy.
- **Icons**: Lucide React only (no emojis as icons).
- **Surfaces**: 1px subtle borders (`#E5E7EB`), soft shadows (`0 1px 2px rgba(0,0,0,0.04)`), and 8px button radii.

---

## 8. License & Safety Disclaimer

SafeHer is open-source software built for community safety and rapid emergency coordination. Always contact local emergency authorities (112 / 911 / 999) directly in life-threatening situations.
