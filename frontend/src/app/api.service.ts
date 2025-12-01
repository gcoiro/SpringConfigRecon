import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AnalyzeRequest {
  service_name: string;
  env_url: string;
  general_prefixes?: string[];
  general_keys?: string[];
}

export interface AnalyzeResponse {
  service_name: string;
  fetched_from: string;
  property_count: number;
  general_property_count: number;
  service_specific_count: number;
  application_yaml: string;
  microservice_yaml: string;
  summary: Record<string, string>;
}

@Injectable()
export class ApiService {
  constructor(private http: HttpClient) {}

  analyze(request: AnalyzeRequest): Observable<AnalyzeResponse> {
    return this.http.post<AnalyzeResponse>('/api/analyze', request);
  }
}
