import pytest

def test_trigger_sos_alert(client, auth_headers):
    payload = {
        "type": "sos",
        "lat": 28.6328,
        "lng": 77.2197,
        "meta": {"method": "button_press"}
    }
    response = client.post("/api/alerts/trigger", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "sos"
    assert data["lat"] == 28.6328
    assert data["lng"] == 77.2197
    assert data["status"] == "triggered"
    assert data["user_name"] == "Test User"
    assert "id" in data

def test_alert_history(client, auth_headers):
    # Trigger 2 alerts
    client.post("/api/alerts/trigger", json={"type": "scream", "lat": 28.61, "lng": 77.20}, headers=auth_headers)
    client.post("/api/alerts/trigger", json={"type": "shake", "lat": 28.62, "lng": 77.21}, headers=auth_headers)

    response = client.get("/api/alerts/history", headers=auth_headers)
    assert response.status_code == 200
    alerts = response.json()
    assert len(alerts) >= 2
    types = [a["type"] for a in alerts]
    assert "scream" in types
    assert "shake" in types

def test_acknowledge_and_resolve_alert(client, auth_headers):
    create_res = client.post(
        "/api/alerts/trigger",
        json={"type": "voice", "lat": 28.63, "lng": 77.22, "meta": {"keyword": "help me"}},
        headers=auth_headers
    )
    alert_id = create_res.json()["id"]

    # Acknowledge
    ack_res = client.post(f"/api/alerts/{alert_id}/acknowledge", headers=auth_headers)
    assert ack_res.status_code == 200
    assert ack_res.json()["status"] == "acknowledged"
    assert ack_res.json()["acknowledged_at"] is not None

    # Resolve
    res_res = client.post(f"/api/alerts/{alert_id}/resolve", headers=auth_headers)
    assert res_res.status_code == 200
    assert res_res.json()["status"] == "resolved"
    assert res_res.json()["resolved_at"] is not None

def test_acknowledge_invalid_alert_id(client, auth_headers):
    ack_res = client.post("/api/alerts/99999/acknowledge", headers=auth_headers)
    assert ack_res.status_code == 404
