import pytest

def test_report_and_get_nearby_incidents(client, auth_headers):
    # Report incident 1 (close by)
    payload_close = {
        "lat": 28.6328,
        "lng": 77.2197,
        "category": "Poor Lighting",
        "description": "Dark corridor near subway exit",
        "severity": "Medium"
    }
    res1 = client.post("/api/incidents/report", json=payload_close, headers=auth_headers)
    assert res1.status_code == 201
    inc1 = res1.json()
    assert inc1["category"] == "Poor Lighting"

    # Report incident 2 (far away: Mumbai ~1150 km)
    payload_far = {
        "lat": 19.0760,
        "lng": 72.8777,
        "category": "Harassment",
        "description": "Far incident",
        "severity": "High"
    }
    res2 = client.post("/api/incidents/report", json=payload_far, headers=auth_headers)
    assert res2.status_code == 201

    # Query nearby with radius 10 km from Connaught Place (28.6328, 77.2197)
    nearby_res = client.get("/api/incidents/nearby?lat=28.6328&lng=77.2197&radius=10.0")
    assert nearby_res.status_code == 200
    nearby = nearby_res.json()
    # Close incident must be included, Mumbai incident must be excluded
    ids = [i["id"] for i in nearby]
    assert inc1["id"] in ids
    assert res2.json()["id"] not in ids
    assert nearby[0]["distance_km"] is not None
