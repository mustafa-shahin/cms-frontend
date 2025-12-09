import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '@cms/shared/api-interfaces';
import {
  ThemeSettings,
  TypographySettings,
  LayoutSettings
} from '@cms/shared/customization-models';

@Injectable({
  providedIn: 'root'
})
export class CustomizationApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:7209/api/v1/customization';

  // Theme API
  getThemeSettings(): Observable<ThemeSettings> {
    return this.http
      .get<ApiResponse<ThemeSettings>>(`${this.baseUrl}/theme`)
      .pipe(map(response => response.data!));
  }

  updateThemeSettings(settings: ThemeSettings): Observable<ThemeSettings> {
    return this.http
      .put<ApiResponse<ThemeSettings>>(`${this.baseUrl}/theme`, { themeSettings: settings })
      .pipe(map(response => response.data!));
  }

  // Typography API
  getTypographySettings(): Observable<TypographySettings> {
    return this.http
      .get<ApiResponse<TypographySettings>>(`${this.baseUrl}/typography`)
      .pipe(map(response => response.data!));
  }

  updateTypographySettings(settings: TypographySettings): Observable<TypographySettings> {
    return this.http
      .put<ApiResponse<TypographySettings>>(`${this.baseUrl}/typography`, { typographySettings: settings })
      .pipe(map(response => response.data!));
  }

  // Layout API
  getLayoutSettings(): Observable<LayoutSettings> {
    return this.http
      .get<ApiResponse<LayoutSettings>>(`${this.baseUrl}/layout`)
      .pipe(map(response => response.data!));
  }

  updateLayoutSettings(settings: LayoutSettings): Observable<LayoutSettings> {
    return this.http
      .put<ApiResponse<LayoutSettings>>(`${this.baseUrl}/layout`, { layoutSettings: settings })
      .pipe(map(response => response.data!));
  }
}
