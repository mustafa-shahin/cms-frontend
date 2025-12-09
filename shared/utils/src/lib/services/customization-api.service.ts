import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import {
  ThemeSettings,
  TypographySettings,
  LayoutSettings,
  TextStyleType,
  TextStyle
} from '@cms/shared/customization-models';

@Injectable({
  providedIn: 'root'
})
export class CustomizationApiService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'customization';

  // Theme API
  getThemeSettings(): Observable<ThemeSettings> {
    return this.apiService.get<ThemeSettings>(`${this.endpoint}/theme`);
  }

  updateThemeSettings(settings: ThemeSettings): Observable<ThemeSettings> {
    return this.apiService.put<ThemeSettings>(`${this.endpoint}/theme`, { themeSettings: settings });
  }

  getTypographySettings(): Observable<TypographySettings> {
    return this.apiService.get<TypographySettings>(`${this.endpoint}/typography`).pipe(
      map(settings => this.transformResponse(settings))
    );
  }

  updateTypographySettings(settings: TypographySettings): Observable<TypographySettings> {
    // Backend expects string keys for Enum Dictionary (JsonStringEnumConverter)
    const transformedTextStyles: Record<string, TextStyle> = {};
    
    // Frontend state uses numeric keys (0, 1, etc)
    if (settings && settings.textStyles) {
        Object.entries(settings.textStyles).forEach(([key, value]) => {
          const enumKey = Number(key);
          
          // Helper to get string name from numeric enum value
          const enumName = TextStyleType[enumKey];
          
          if (enumName) {
            transformedTextStyles[enumName] = value;
          }
        });
    }

    const payload = {
      ...settings,
      textStyles: transformedTextStyles
    };

    return this.apiService.put<TypographySettings>(`${this.endpoint}/typography`, { typographySettings: payload }).pipe(
      map(settings => this.transformResponse(settings))
    );
  }

  private transformResponse(settings: TypographySettings): TypographySettings {
    if (settings && settings.textStyles) {
      const transformedTextStyles: Record<number, TextStyle> = {};
      
      Object.entries(settings.textStyles).forEach(([key, value]) => {
        // key could be "heading1" or "Heading1" or "0" (if numeric)
        
        // Try direct number parsing first
        const numericKey = Number(key);
        if (!isNaN(numericKey) && TextStyleType[numericKey]) {
            transformedTextStyles[numericKey] = value;
            return;
        }

        // Find enum key by case-insensitive matching for string keys
        const enumKeyName = Object.keys(TextStyleType).find(
          k => k.toLowerCase() === key.toLowerCase() && isNaN(Number(k))
        );
        
        if (enumKeyName) {
          const enumValue = (TextStyleType as any)[enumKeyName];
          if (typeof enumValue === 'number') {
            transformedTextStyles[enumValue] = value;
          }
        }
      });
      
      return {
        ...settings,
        textStyles: transformedTextStyles as any
      };
    }
    return settings;
  }

  // Layout API
  getLayoutSettings(): Observable<LayoutSettings> {
    return this.apiService.get<LayoutSettings>(`${this.endpoint}/layout`);
  }

  updateLayoutSettings(settings: LayoutSettings): Observable<LayoutSettings> {
    return this.apiService.put<LayoutSettings>(`${this.endpoint}/layout`, { layoutSettings: settings });
  }
}
