import pytest

def test_get_contacts_empty(client, auth_headers):
    response = client.get("/api/contacts", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []

def test_add_and_get_contact(client, auth_headers):
    payload = {
        "name": "Mom",
        "phone": "+91 98765 00001",
        "email": "mom@example.com",
        "relation": "Mother",
        "is_guardian": True
    }
    response = client.post("/api/contacts", json=payload, headers=auth_headers)
    assert response.status_code == 201
    created = response.json()
    assert created["name"] == "Mom"
    assert created["phone"] == "+91 98765 00001"
    assert created["is_guardian"] is True
    contact_id = created["id"]

    # Verify retrieval
    get_res = client.get("/api/contacts", headers=auth_headers)
    assert get_res.status_code == 200
    contacts = get_res.json()
    assert len(contacts) == 1
    assert contacts[0]["id"] == contact_id

def test_contact_limit_five(client, auth_headers):
    # Add 5 contacts
    for i in range(5):
        payload = {
            "name": f"Contact {i}",
            "phone": f"+91 98000 0000{i}",
            "email": f"c{i}@example.com",
            "relation": "Friend",
            "is_guardian": False
        }
        res = client.post("/api/contacts", json=payload, headers=auth_headers)
        assert res.status_code == 201

    # 6th contact should fail with 400
    extra_payload = {
        "name": "Contact 6",
        "phone": "+91 98000 00006",
        "email": "c6@example.com",
        "relation": "Friend",
        "is_guardian": False
    }
    res = client.post("/api/contacts", json=extra_payload, headers=auth_headers)
    assert res.status_code == 400
    assert "maximum limit of 5" in res.json()["detail"].lower()

def test_delete_contact(client, auth_headers):
    payload = {
        "name": "ToDelete",
        "phone": "+91 99999 11111",
        "relation": "Friend",
        "is_guardian": False
    }
    create_res = client.post("/api/contacts", json=payload, headers=auth_headers)
    assert create_res.status_code == 201
    contact_id = create_res.json()["id"]

    delete_res = client.delete(f"/api/contacts/{contact_id}", headers=auth_headers)
    assert delete_res.status_code == 204

    # Second delete returns 404
    delete_again = client.delete(f"/api/contacts/{contact_id}", headers=auth_headers)
    assert delete_again.status_code == 404
