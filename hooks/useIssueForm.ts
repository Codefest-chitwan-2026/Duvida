import { useState } from 'react';
import { IssueCategoryId, IssueFormData, SeverityLevel } from '../types/issue';

// Mock starting data so the screen matches the design out of the box.
// Nothing here is wired up to a real backend.
const initialFormData: IssueFormData = {
  category: 'pothole',
  description: 'Large pothole causing damage to vehicles and inconvenience.',
  severity: 'high',
  location: {
    address: 'Mid Baneshwor, Kathmandu, Nepal',
    latitude: 27.71,
    longitude: 85.33,
  },
  photos: [],
};

export function useIssueForm() {
  const [formData, setFormData] = useState<IssueFormData>(initialFormData);

  const selectCategory = (category: IssueCategoryId) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const selectSeverity = (severity: SeverityLevel) => {
    setFormData((prev) => ({ ...prev, severity }));
  };

  const updateDescription = (description: string) => {
    setFormData((prev) => ({ ...prev, description }));
  };

  return {
    formData,
    selectCategory,
    selectSeverity,
    updateDescription,
  };
}
