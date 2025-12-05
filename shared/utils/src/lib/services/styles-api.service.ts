import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AppStyles } from './style.service';

export interface StyleSettingsResponse {
  // Brand colors
  primaryColor: string;
  secondaryColor: string;

  // Layout backgrounds
  navbarBackground: string;
  footerBackground: string;

  // Text colors
  textColor: string;
  headingColor: string;

  // Link colors
  linkColor: string;
  linkHoverColor: string;
  linkVisitedColor: string;

  // State colors
  successColor: string;
  warningColor: string;
  errorColor: string;

  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
}

export interface UpdateStyleSettingsRequest {
  // Brand colors
  primaryColor: string;
  secondaryColor: string;

  // Layout backgrounds
  navbarBackground: string;
  footerBackground: string;

  // Text colors
  textColor: string;
  headingColor: string;

  // Link colors
  linkColor: string;
  linkHoverColor: string;
  linkVisitedColor: string;

  // State colors
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StylesApiService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = '/styles'; 

  /**
   * Get current style settings from the API
   */
  getStyleSettings(): Observable<StyleSettingsResponse> {
    return this.apiService.get<StyleSettingsResponse>(this.endpoint);
  }

  /**
   * Update style settings via API
   */
  updateStyleSettings(styles: UpdateStyleSettingsRequest): Observable<StyleSettingsResponse> {
    return this.apiService.put<StyleSettingsResponse>(this.endpoint, styles);
  }

  /**
   * Convert API response to AppStyles format
   */
  toAppStyles(response: StyleSettingsResponse): AppStyles {
    return {
      primaryColor: response.primaryColor,
      secondaryColor: response.secondaryColor,
      navbarBackground: response.navbarBackground,
      footerBackground: response.footerBackground,
      textColor: response.textColor,
      headingColor: response.headingColor,
      linkColor: response.linkColor,
      linkHoverColor: response.linkHoverColor,
      linkVisitedColor: response.linkVisitedColor,
      successColor: response.successColor,
      warningColor: response.warningColor,
      errorColor: response.errorColor,
    };
  }

  /**
   * Convert AppStyles to API request format
   */
  toApiRequest(styles: AppStyles): UpdateStyleSettingsRequest {
    return {
      primaryColor: styles.primaryColor,
      secondaryColor: styles.secondaryColor,
      navbarBackground: styles.navbarBackground,
      footerBackground: styles.footerBackground,
      textColor: styles.textColor,
      headingColor: styles.headingColor,
      linkColor: styles.linkColor,
      linkHoverColor: styles.linkHoverColor,
      linkVisitedColor: styles.linkVisitedColor,
      successColor: styles.successColor,
      warningColor: styles.warningColor,
      errorColor: styles.errorColor,
    };
  }
}
