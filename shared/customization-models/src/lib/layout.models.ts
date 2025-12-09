/**
 * Layout customization models
 */

export enum HeaderTemplate {
  Minimal = 0,
  Standard = 1,
  Full = 2
}

export enum FooterTemplate {
  Minimal = 0,
  Standard = 1,
  Full = 2
}

export enum Placement {
  Left = 0,
  Center = 1,
  Right = 2
}

export interface HeaderOptions {
  template: HeaderTemplate;
  logoPlacement: Placement;
  showSearch: boolean;
  stickyHeader: boolean;
}

export interface FooterOptions {
  template: FooterTemplate;
  columnCount: number; // 1-4
  showSocialLinks: boolean;
  showNewsletter: boolean;
}

export interface SpacingConfiguration {
  containerMaxWidth: number;  // 640-1920px
  sectionPadding: number;     // 1-8 rem
  componentGap: number;       // 0.5-4 rem
}

export interface LayoutSettings {
  headerConfiguration: HeaderOptions;
  footerConfiguration: FooterOptions;
  spacing: SpacingConfiguration;
  lastModifiedAt?: string;
  lastModifiedBy?: string;
}

/**
 * Default layout settings
 */
export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  headerConfiguration: {
    template: HeaderTemplate.Standard,
    logoPlacement: Placement.Left,
    showSearch: true,
    stickyHeader: true
  },
  footerConfiguration: {
    template: FooterTemplate.Standard,
    columnCount: 3,
    showSocialLinks: true,
    showNewsletter: true
  },
  spacing: {
    containerMaxWidth: 1280,
    sectionPadding: 4,
    componentGap: 1
  }
};
