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

export interface IssueFormData {
  issueId: string;
  category: IssueCategoryId;
  description: string;
  severity: SeverityLevel;
  location: IssueLocation;
  photos: string[];
}
