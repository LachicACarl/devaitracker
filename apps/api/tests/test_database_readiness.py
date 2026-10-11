import asyncio
from collections.abc import Iterable

import httpx

from apps.api.app.config import Settings
from apps.api.app.database_readiness import check_database_readiness


class FakeAsyncClient:
    responses: Iterable[httpx.Response] = ()
    error: httpx.HTTPError | None = None

    def __init__(self, *args, **kwargs) -> None:
        self._responses = iter(self.responses)

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        return None

    async def get(self, *args, **kwargs) -> httpx.Response:
        if self.error:
            raise self.error
        return next(self._responses)


def make_settings(**overrides) -> Settings:
    values = {
        "supabase_url": "https://example.supabase.co",
        "supabase_anon_key": "anon-key",
        "supabase_service_role_key": None,
        "database_url": None,
    }
    values.update(overrides)
    return Settings(**values)


def test_database_readiness_reports_missing_required_configuration() -> None:
    result = asyncio.run(
        check_database_readiness(make_settings(supabase_url="", supabase_anon_key=""))
    )

    assert result["status"] == "not_ready"
    assert result["schema"]["status"] == "not_checked"
    assert result["issues"] == [
        {
            "code": "missing_required_configuration",
            "fields": ["supabase_url", "supabase_anon_key"],
        }
    ]


def test_database_readiness_reports_missing_schema(monkeypatch) -> None:
    FakeAsyncClient.responses = [
        httpx.Response(
            404,
            json={
                "code": "PGRST205",
                "message": "Could not find the table in the schema cache",
            },
        )
        for _ in range(3)
    ]
    FakeAsyncClient.error = None
    monkeypatch.setattr("apps.api.app.database_readiness.httpx.AsyncClient", FakeAsyncClient)

    result = asyncio.run(check_database_readiness(make_settings()))

    assert result["status"] == "not_ready"
    assert result["schema"]["status"] == "problem"
    assert [table["status"] for table in result["schema"]["tables"]] == ["missing"] * 3
    assert result["issues"][0]["code"] == "schema_check_failed"


def test_database_readiness_reports_missing_required_column(monkeypatch) -> None:
    FakeAsyncClient.responses = [
        httpx.Response(
            400,
            json={
                "code": "42703",
                "message": "column api_catalog.is_public does not exist",
            },
        ),
        httpx.Response(200, json=[]),
        httpx.Response(200, json=[]),
    ]
    FakeAsyncClient.error = None
    monkeypatch.setattr("apps.api.app.database_readiness.httpx.AsyncClient", FakeAsyncClient)

    result = asyncio.run(check_database_readiness(make_settings()))

    assert result["status"] == "not_ready"
    assert result["schema"]["status"] == "problem"
    assert result["schema"]["tables"][0] == {
        "table": "providers",
        "status": "missing_column",
    }


def test_database_readiness_reports_ready_without_exposing_config_values(monkeypatch) -> None:
    FakeAsyncClient.responses = [httpx.Response(200, json=[]) for _ in range(3)]
    FakeAsyncClient.error = None
    monkeypatch.setattr("apps.api.app.database_readiness.httpx.AsyncClient", FakeAsyncClient)

    result = asyncio.run(
        check_database_readiness(
            make_settings(
                supabase_anon_key="sensitive-anon-key",
                supabase_service_role_key="sensitive-service-role-key",
            )
        )
    )

    assert result["status"] == "ready"
    assert result["schema"]["status"] == "ok"
    assert result["configuration"]["required"]["supabase_anon_key"] is True
    assert result["configuration"]["optional"]["supabase_service_role_key"] is True
    assert "sensitive-anon-key" not in str(result)
    assert "sensitive-service-role-key" not in str(result)


def test_database_readiness_reports_authorization_errors(monkeypatch) -> None:
    FakeAsyncClient.responses = [httpx.Response(403) for _ in range(3)]
    FakeAsyncClient.error = None
    monkeypatch.setattr("apps.api.app.database_readiness.httpx.AsyncClient", FakeAsyncClient)

    result = asyncio.run(check_database_readiness(make_settings()))

    assert result["status"] == "not_ready"
    assert result["schema"]["status"] == "problem"
    assert [table["status"] for table in result["schema"]["tables"]] == [
        "permission_denied",
        "permission_denied",
        "permission_denied",
    ]


def test_database_readiness_reports_invalid_credentials(monkeypatch) -> None:
    FakeAsyncClient.responses = [httpx.Response(401) for _ in range(3)]
    FakeAsyncClient.error = None
    monkeypatch.setattr("apps.api.app.database_readiness.httpx.AsyncClient", FakeAsyncClient)

    result = asyncio.run(check_database_readiness(make_settings()))

    assert result["status"] == "not_ready"
    assert result["schema"]["status"] == "problem"
    assert [table["status"] for table in result["schema"]["tables"]] == [
        "invalid_credentials",
        "invalid_credentials",
        "invalid_credentials",
    ]


def test_database_readiness_reports_unavailable_database(monkeypatch) -> None:
    FakeAsyncClient.responses = []
    FakeAsyncClient.error = httpx.ConnectError("connection failed")
    monkeypatch.setattr("apps.api.app.database_readiness.httpx.AsyncClient", FakeAsyncClient)

    result = asyncio.run(check_database_readiness(make_settings()))

    assert result["status"] == "not_ready"
    assert result["schema"]["status"] == "unavailable"
    assert result["issues"] == [{"code": "supabase_unavailable"}]
