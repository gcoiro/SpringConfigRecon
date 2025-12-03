import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EnvInspectRequest {
  env_url: string;
}

export interface EnvProperty {
  key: string;
  value: unknown;
  source: string;
  origin?: string | null;
}

export interface EnvInspectResponse {
  fetched_from: string;
  property_count: number;
  properties: EnvProperty[];
}

@Injectable()
export class ApiService {
  constructor(private http: HttpClient) {}

  inspect(request: EnvInspectRequest): Observable<EnvInspectResponse> {
    return this.http.post<EnvInspectResponse>('/api/env', request);
  }
}
