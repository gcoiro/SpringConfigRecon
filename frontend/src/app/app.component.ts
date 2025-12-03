import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiService, EnvInspectResponse } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Spring Config Recon';
  loading = false;
  error?: string;
  result?: EnvInspectResponse;

  form = this.fb.group({
    env_url: ['', Validators.required]
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
      env_url: this.form.value.env_url!
    };

    this.api.inspect(payload).subscribe({
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
