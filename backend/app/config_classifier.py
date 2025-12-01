"""Utilities to partition Spring Boot environment properties into shared and service scopes."""

from __future__ import annotations

from typing import Dict, Iterable, Tuple

DEFAULT_GENERAL_PREFIXES = (
    "spring.application",
    "spring.cloud",
    "spring.config",
    "spring.profiles",
    "spring.main",
    "spring.jackson",
    "spring.mvc",
    "spring.web",
    "spring.resources",
    "spring.servlet",
    "management.",
    "logging.",
    "eureka.",
    "ribbon.",
    "feign.",
    "resilience4j.",
    "server.shutdown",
)

DEFAULT_GENERAL_KEYS = (
    "server.port",
    "server.compression.enabled",
    "server.forward-headers-strategy",
)


def _should_be_general(
    key: str,
    service_name: str | None,
    general_prefixes: Iterable[str],
    general_keys: Iterable[str],
) -> bool:
    """Return True when the key should live in ``application.yml``.

    The classifier considers a key general when it matches one of the configured
    prefixes or explicit keys. Keys that reference the service name directly are
    always treated as service-specific.
    """

    lowered = key.lower()
    if service_name and service_name.lower() in lowered:
        return False

    for explicit in general_keys:
        if lowered == explicit.lower():
            return True

    for prefix in general_prefixes:
        if lowered.startswith(prefix.lower()):
            return True
    return False


def classify_properties(
    properties: Dict[str, str],
    service_name: str,
    general_prefixes: Iterable[str] | None = None,
    general_keys: Iterable[str] | None = None,
) -> Tuple[Dict[str, str], Dict[str, str]]:
    """Split a flat dictionary of properties into general and service-specific sets."""

    general_prefixes = tuple(general_prefixes or DEFAULT_GENERAL_PREFIXES)
    general_keys = tuple(general_keys or DEFAULT_GENERAL_KEYS)

    general: Dict[str, str] = {}
    service_specific: Dict[str, str] = {}

    for key in sorted(properties.keys()):
        value = properties[key]
        if _should_be_general(key, service_name, general_prefixes, general_keys):
            general[key] = value
        else:
            service_specific[key] = value
    return general, service_specific


def nested_from_properties(properties: Dict[str, str]) -> Dict[str, object]:
    """Convert ``{"a.b": 1, "a.c": 2}`` into nested dictionaries suitable for YAML."""

    root: Dict[str, object] = {}
    for dotted_key, value in properties.items():
        cursor = root
        parts = dotted_key.split(".")
        for part in parts[:-1]:
            cursor = cursor.setdefault(part, {})  # type: ignore[assignment]
        cursor[parts[-1]] = value
    return root
