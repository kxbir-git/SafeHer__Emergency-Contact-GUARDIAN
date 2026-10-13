import pytest

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "SafeHer API is running"}

def test_register_success(client):
    payload = {
        "email": "newuser@example.com",
        "password": "SecurePassword123",
        "full_name": "New User",
        "phone": "+91 91234 56789",
        "blood_group": "A+"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["full_name"] == "New User"
    assert data["user"]["blood_group"] == "A+"

def test_register_duplicate_email(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "anotherpassword",
        "full_name": "Duplicate User",
        "phone": "+91 11111 22222",
        "blood_group": "O+"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()

def test_login_success(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "password123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email

def test_login_invalid_password(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "WrongPassword"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()

def test_login_nonexistent_user(client):
    payload = {
        "email": "nobody@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
