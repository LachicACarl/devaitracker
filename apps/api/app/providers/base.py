from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ModelRequest:
    model: str
    messages: list[dict[str, str]]
    max_tokens: int = 1024
    temperature: float = 0.7
    system_prompt: str | None = None
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ModelResponse:
    content: str
    provider: str
    model: str
    input_tokens: int | None = None
    output_tokens: int | None = None
    cost_usd: float | None = None
    usage_verified: bool = False


class AIProvider(ABC):
    provider_id: str

    @abstractmethod
    async def generate(
        self,
        request: ModelRequest,
        credentials: dict[str, Any],
    ) -> ModelResponse:
        """Execute a model request through the provider."""
        raise NotImplementedError
