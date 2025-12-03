"""HTTP utilities to consume Spring Boot actuator environments."""

from __future__ import annotations

from typing import Dict, List

import httpx


class EnvRetrievalError(RuntimeError):
    """Raised when the actuator endpoint cannot be reached or parsed."""


async def fetch_actuator_environment(env_url: str, timeout: float = 10.0) -> Dict:
    """Fetch ``/actuator/env`` from a microservice and return the parsed JSON body."""

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(env_url)
            response.raise_for_status()
            return response.json()
    except (httpx.RequestError, httpx.HTTPStatusError) as exc:  # pragma: no cover - network
        raise EnvRetrievalError(f"No se pudo recuperar el entorno desde {env_url}: {exc}") from exc


def flatten_actuator_properties(env_payload: Dict) -> Dict[str, str]:
    """Flatten the Spring Boot environment payload into a single property dictionary."""

    properties: Dict[str, str] = {}
    sources = env_payload.get("propertySources") or []

    for source in sources:
        source_properties = source.get("properties") or {}
        for key, detail in source_properties.items():
            if key not in properties:  # Preserve first occurrence (highest priority)
                properties[key] = detail.get("value") if isinstance(detail, dict) else detail
    return properties


def collect_property_details(env_payload: Dict) -> List[Dict[str, object]]:
    """Return the list of properties with the origin/source that provided each active value."""

    properties: List[Dict[str, object]] = []
    seen_keys = set()
    sources = env_payload.get("propertySources") or []

    for source in sources:
        source_name = source.get("name") or "origen desconocido"
        source_properties = source.get("properties") or {}
        for key, detail in source_properties.items():
            if key in seen_keys:
                continue  # first occurrence wins (highest priority)
            seen_keys.add(key)

            value = detail.get("value") if isinstance(detail, dict) else detail
            origin = detail.get("origin") if isinstance(detail, dict) else None
            properties.append(
                {
                    "key": key,
                    "value": value,
                    "source": source_name,
                    "origin": origin,
                }
            )
    return properties
