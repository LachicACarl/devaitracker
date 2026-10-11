from __future__ import annotations

from typing import Any

from .base import AIProvider, ModelRequest, ModelResponse


class OpenAIProvider(AIProvider):
    provider_id = 'openai'

    async def generate(
        self,
        request: ModelRequest,
        credentials: dict[str, Any],
    ) -> ModelResponse:
        api_key = credentials.get('api_key')
        if not api_key:
            raise ValueError('API key missing for OpenAI provider')

        content = 'OpenAI provider response placeholder.'
        if request.messages:
            content = request.messages[-1].get('content', content)

        return ModelResponse(
            content=content,
            provider=self.provider_id,
            model=request.model,
            input_tokens=0,
            output_tokens=len(content.split()),
            cost_usd=0.0,
            usage_verified=True,
        )
