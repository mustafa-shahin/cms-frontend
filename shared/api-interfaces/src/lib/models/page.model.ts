export enum PageStatus {
  Draft = 0,
  Published = 1,
  Archived = 2,
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  status: PageStatus;
  components?: any;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  version: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PageVersion {
  id: number;
  pageId: number;
  version: number;
  title: string;
  components?: any;
  changeNotes?: string;
  createdAt: string;
  createdByUserId: number;
}
