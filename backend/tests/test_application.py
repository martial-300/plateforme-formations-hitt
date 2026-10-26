from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_documentation_swagger_disponible():
    reponse = client.get("/openapi.json")
    assert reponse.status_code == 200
    assert reponse.json()["info"]["title"] == "HIT-T Reco"


def test_cors_limite_aux_origines_configurees():
    autorisee = client.options(
        "/api/v1/formations",
        headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET"},
    )
    assert autorisee.headers.get("access-control-allow-origin") == "http://localhost:5173"

    refusee = client.options(
        "/api/v1/formations",
        headers={"Origin": "https://inconnu.example.com", "Access-Control-Request-Method": "GET"},
    )
    assert "access-control-allow-origin" not in refusee.headers
