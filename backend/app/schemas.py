"""Pydantic schemas for request/response payloads."""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl, validator


class AnalyzeRequest(BaseModel):
    service_name: str = Field(..., description="Nombre del microservicio (para generar el archivo dedicado)")
    env_url: HttpUrl = Field(..., description="URL completa del endpoint /actuator/env dentro del clúster")
    general_prefixes: Optional[List[str]] = Field(
        None, description="Prefijos que deben considerarse configuración compartida"
    )
    general_keys: Optional[List[str]] = Field(
        None, description="Llaves exactas que deben considerarse configuración compartida"
    )

    @validator("service_name")
    def _normalize_service_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("El nombre del microservicio no puede estar vacío")
        return cleaned


class AnalyzeResponse(BaseModel):
    service_name: str
    fetched_from: str
    property_count: int
    general_property_count: int
    service_specific_count: int
    application_yaml: str
    microservice_yaml: str
    summary: Dict[str, str]
