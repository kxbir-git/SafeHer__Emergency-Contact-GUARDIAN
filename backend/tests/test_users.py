import pytest

def test_get_current_user_profile(client, auth_headers, test_user):
    response = client.get("/api/users/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name
    assert data["blood_group"] == test_user.blood_group

def test_get_current_user_unauthorized(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401

def test_update_current_user_profile(client, auth_headers):
    payload = {
        "full_name": "Updated Name",
        "phone": "+91 98888 77777",
        "blood_group": "AB+"
    }
    response = client.put("/api/users/me", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Updated Name"
    assert data["phone"] == "+91 98888 77777"
    assert data["blood_group"] == "AB+"

    # Verify persistent update
    get_res = client.get("/api/users/me", headers=auth_headers)
    assert get_res.json()["full_name"] == "Updated Name"
