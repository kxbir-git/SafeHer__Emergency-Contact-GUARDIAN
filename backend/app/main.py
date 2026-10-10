import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, users, contacts, alerts, locations, incidents, ai, socket

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# CORS setup
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(',')]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(contacts.router, prefix=settings.API_PREFIX)
app.include_router(alerts.router, prefix=settings.API_PREFIX)
app.include_router(locations.router, prefix=settings.API_PREFIX)
app.include_router(incidents.router, prefix=settings.API_PREFIX)
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(socket.router)
@app.get("/")
async def read_root():
    return {"message": "SafeHer API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
