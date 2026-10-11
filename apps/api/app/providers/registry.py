from __future__ import annotations

from typing import Any

PROVIDER_REGISTRY: dict[str, Any] = {}


def register_provider(provider_id: str, adapter: Any) -> None:
    PROVIDER_REGISTRY[provider_id] = adapter


def get_provider(provider_id: str) -> Any:
    try:
        return PROVIDER_REGISTRY[provider_id]
    except KeyError as exc:
        raise ValueError(f"Unsupported provider: {provider_id}") from exc
