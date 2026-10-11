from __future__ import annotations

from typing import Any

import httpx

from .config import Settings

SCHEMA_TABLES_TO_VERIFY: dict[str, tuple[str, ...]] = {
    "providers": ("id", "is_public"),
    "models": ("id", "is_public"),
    "api_catalog": ("id", "is_public"),
}
REQUEST_TIMEOUT_SECONDS = 10.0


def _is_configured(value: str | None) -> bool:
    return bool(value and value.strip())


def _rest_url(supabase_url: str, table: str) -> str:
    return f"{supabase_url.rstrip('/')}/rest/v1/{table}"


def _classify_table_response(table: str, response: httpx.Response) -> dict[str, Any]:
    if response.status_code == 200:
        return {"table": table, "status": "ok"}

    error_code: str | None = None
    try:
        payload = response.json()
        if isinstance(payload, dict):
            error_code = payload.get("code")
    except ValueError:
        pass

    if response.status_code == 404 and error_code == "PGRST205":
        return {"table": table, "status": "missing"}

    if response.status_code == 400 and error_code == "42703":
        return {"table": table, "status": "missing_column"}

    if response.status_code == 401:
        return {"table": table, "status": "invalid_credentials"}

    if response.status_code == 403:
        return {"table": table, "status": "permission_denied"}

    return {
        "table": table,
        "status": "error",
        "http_status": response.status_code,
    }


async def check_database_readiness(settings: Settings) -> dict[str, Any]:
    required_config = {
        "supabase_url": _is_configured(settings.supabase_url),
        "supabase_anon_key": _is_configured(settings.supabase_anon_key),
    }
    optional_config = {
        "supabase_service_role_key": _is_configured(settings.supabase_service_role_key),
        "database_url": _is_configured(settings.database_url),
    }

    missing_required = [name for name, configured in required_config.items() if not configured]
    result: dict[str, Any] = {
        "status": "ready",
        "configuration": {
            "required": required_config,
            "optional": optional_config,
        },
        "schema": {
            "tables_checked": list(SCHEMA_TABLES_TO_VERIFY),
            "tables": [],
        },
    }

    if missing_required:
        result["status"] = "not_ready"
        result["schema"]["status"] = "not_checked"
        result["issues"] = [
            {
                "code": "missing_required_configuration",
                "fields": missing_required,
            }
        ]
        return result

    headers = {
        "apikey": settings.supabase_anon_key or "",
                "Authorization": "Bearer " + (settings.supabase_anon_key or ""),
    }

    try:
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
            table_results = []
            for table, required_columns in SCHEMA_TABLES_TO_VERIFY.items():
                response = await client.get(
                    _rest_url(settings.supabase_url or "", table),
                    headers=headers,
                    params={"select": ",".join(required_columns), "limit": "1"},
                )
                table_results.append(_classify_table_response(table, response))
    except httpx.HTTPError:
        result["status"] = "not_ready"
        result["schema"]["status"] = "unavailable"
        result["issues"] = [{"code": "supabase_unavailable"}]
        return result

    result["schema"]["tables"] = table_results
    problem_tables = [table for table in table_results if table["status"] != "ok"]
    if problem_tables:
        result["status"] = "not_ready"
        result["schema"]["status"] = "problem"
        result["issues"] = [
            {
                "code": "schema_check_failed",
                "tables": problem_tables,
            }
        ]
    else:
        result["schema"]["status"] = "ok"

    return result
