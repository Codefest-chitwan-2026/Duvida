export type IssueCategoryId =
  | 'pothole'
  | 'streetlight'
  | 'garbage'
  | 'traffic'
  | 'water'
  | 'other';

export interface IssueCategory {
  id: IssueCategoryId;
  label: string;
  icon: string;
}

export type SeverityLevel = 'low' | 'medium' | 'high';

export interface IssueLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export type MediaKind = 'image' | 'video';

export interface MediaItem {
  id: string;
  uri: string;
  name: string;
  mimeType: string;
  fileSize?: number;
  mediaType: MediaKind;
}

export interface IssueFormData {
  issueId: string;
  category: IssueCategoryId;
  description: string;
  severity: SeverityLevel;
  location: IssueLocation;
  media: MediaItem[];
}
