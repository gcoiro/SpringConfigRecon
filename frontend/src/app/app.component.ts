import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService, AnalyzeResponse } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Spring Config Recon';
  loading = false;
  error?: string;
  result?: AnalyzeResponse;

  prefixes = [
    'spring.application',
    'spring.cloud',
    'spring.profiles',
    'management.',
    'logging.'
  ];

  form = this.fb.group({
    service_name: ['', Validators.required],
    env_url: ['', Validators.required],
    general_prefixes: [[] as string[]],
    general_keys: [[] as string[]]
  });

  constructor(private api: ApiService, private fb: FormBuilder) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = undefined;
    this.result = undefined;

    const payload = {
      service_name: this.form.value.service_name!,
      env_url: this.form.value.env_url!,
      general_prefixes: this.form.value.general_prefixes?.length ? this.form.value.general_prefixes : undefined,
      general_keys: this.form.value.general_keys?.length ? this.form.value.general_keys : undefined
    };

    this.api.analyze(payload).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al contactar el backend';
        this.loading = false;
      }
    });
  }
}
