import json
import pytest

def test_websocket_alerts_ping_pong(client):
    with client.websocket_connect("/ws/alerts") as websocket:
        websocket.send_text("ping")
        data = websocket.receive_text()
        assert "pong" in data

def test_websocket_connect_endpoint(client):
    with client.websocket_connect("/ws/connect") as websocket:
        websocket.send_text("ping")
        data = websocket.receive_text()
        assert "pong" in data

def test_websocket_receives_alert_broadcast(client, auth_headers):
    with client.websocket_connect("/ws/alerts") as websocket:
        # Trigger an alert via HTTP REST API
        trigger_payload = {
            "type": "sos",
            "lat": 28.6328,
            "lng": 77.2197,
            "meta": {"method": "test"}
        }
        res = client.post("/api/alerts/trigger", json=trigger_payload, headers=auth_headers)
        assert res.status_code == 201

        # Check WebSocket received the real-time event
        msg = websocket.receive_text()
        event = json.loads(msg)
        assert event["event"] == "alert_triggered"
        assert event["data"]["type"] == "sos"
        assert event["data"]["user_name"] == "Test User"
