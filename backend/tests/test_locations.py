import pytest

def test_update_and_get_live_location(client, auth_headers):
    # Update location
    update_res = client.post("/api/locations/update", json={"lat": 28.6350, "lng": 77.2210}, headers=auth_headers)
    assert update_res.status_code == 200
    data = update_res.json()
    assert round(data["lat"], 4) == 28.6350
    assert round(data["lng"], 4) == 77.2210
    assert data["user_name"] == "Test User"

    # Get live location (me)
    get_res = client.get("/api/locations/me/live", headers=auth_headers)
    assert get_res.status_code == 200
    live_data = get_res.json()
    assert round(live_data["lat"], 4) == 28.6350
    assert round(live_data["lng"], 4) == 77.2210

def test_get_live_location_fallback_not_reported(client, auth_headers):
    # Query non-reported user id 999
    res = client.get("/api/locations/999/live", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["lat"] is not None
    assert data["lng"] is not None
