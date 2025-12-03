"""FastAPI app to centralize Spring Boot configuration across microservices."""

from __future__ import annotations

import yaml
from fastapi import FastAPI, HTTPException

from .config_classifier import classify_properties, nested_from_properties
from .config_fetcher import (
    EnvRetrievalError,
    collect_property_details,
    fetch_actuator_environment,
    flatten_actuator_properties,
)
from .schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    EnvInspectRequest,
    EnvInspectResponse,
)

app = FastAPI(
    title="Spring Config Recon",
    description=(
        "Servicio que extrae las propiedades publicadas en /actuator/env y propone "
        "la separaciИn correcta entre application.yml y el archivo especヴfico del microservicio."
    ),
    version="0.1.0",
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


async def _inspect_env(request: EnvInspectRequest) -> EnvInspectResponse:
    try:
        env_payload = await fetch_actuator_environment(request.env_url)
    except EnvRetrievalError as exc:  # pragma: no cover - network
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    properties = collect_property_details(env_payload)

    return EnvInspectResponse(
        fetched_from=str(request.env_url),
        property_count=len(properties),
        properties=properties,
    )


@app.post("/env", response_model=EnvInspectResponse)
async def inspect_environment(request: EnvInspectRequest) -> EnvInspectResponse:
    return await _inspect_env(request)


@app.post("/api/env", response_model=EnvInspectResponse)
async def inspect_environment_prefixed(request: EnvInspectRequest) -> EnvInspectResponse:
    return await _inspect_env(request)


async def _analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    try:
        env_payload = await fetch_actuator_environment(request.env_url)
    except EnvRetrievalError as exc:  # pragma: no cover - network
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    properties = flatten_actuator_properties(env_payload)
    general, service_specific = classify_properties(
        properties,
        service_name=request.service_name,
        general_prefixes=request.general_prefixes,
        general_keys=request.general_keys,
    )

    application_yaml = yaml.safe_dump(nested_from_properties(general), sort_keys=True, allow_unicode=True)
    micro_yaml = yaml.safe_dump(
        nested_from_properties(service_specific), sort_keys=True, allow_unicode=True
    )

    summary = {
        "application.yml": (
            "ConfiguraciИn compartida que debe vivir en el config repo centralizada en el archivo"
        ),
        f"{request.service_name}.yml": "ConfiguraciИn especヴfica del microservicio para aislar despliegues",
    }

    return AnalyzeResponse(
        service_name=request.service_name,
        fetched_from=str(request.env_url),
        property_count=len(properties),
        general_property_count=len(general),
        service_specific_count=len(service_specific),
        application_yaml=application_yaml,
        microservice_yaml=micro_yaml,
        summary=summary,
    )


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_environment(request: AnalyzeRequest) -> AnalyzeResponse:
    return await _analyze(request)


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_environment_prefixed(request: AnalyzeRequest) -> AnalyzeResponse:
    return await _analyze(request)


if __name__ == "__main__":  # pragma: no cover - manual start
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
