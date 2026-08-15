import React, { createContext, ReactNode, useContext, useState } from 'react';
import {
  IssueCategoryId,
  IssueFormData,
  MediaItem,
  SeverityLevel,
} from '../types/issue';

function generateIssueId(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `ISS-${yyyy}-${mm}-${dd}-${rand}`;
}

// Mock starting data so the screens match the design out of the box.
// Nothing here is wired up to a real backend.
const initialFormData: Omit<IssueFormData, 'issueId'> = {
  category: 'pothole',
  description: 'Large pothole causing damage to vehicles and inconvenience.',
  severity: 'low',
  location: {
    address: 'Mid Baneshwor, Kathmandu, Nepal',
    latitude: 27.71,
    longitude: 85.33,
  },
  media: [],
  submittedAt: undefined,
};

interface IssueFormContextValue {
  formData: IssueFormData;
  selectCategory: (category: IssueCategoryId) => void;
  selectSeverity: (severity: SeverityLevel) => void;
  updateDescription: (description: string) => void;
  updateLocation: (location: IssueFormData['location']) => void;
  setSubmittedTime: (timeIso?: string) => void;
  addMedia: (items: MediaItem[]) => void;
  removeMedia: (id: string) => void;
}

const IssueFormContext = createContext<IssueFormContextValue | undefined>(undefined);

export function IssueFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<IssueFormData>(() => ({
    ...initialFormData,
    issueId: generateIssueId(),
  }));

  const selectCategory = (category: IssueCategoryId) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const selectSeverity = (severity: SeverityLevel) => {
    setFormData((prev) => ({ ...prev, severity }));
  };

  const updateDescription = (description: string) => {
    setFormData((prev) => ({ ...prev, description }));
  };

  const updateLocation = (location: IssueFormData['location']) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const setSubmittedTime = (timeIso?: string) => {
    setFormData((prev) => ({
      ...prev,
      submittedAt: timeIso || new Date().toISOString(),
    }));
  };

  const addMedia = (items: MediaItem[]) => {
    setFormData((prev) => {
      const existingUris = new Set(prev.media.map((item) => item.uri));
      const newItems = items.filter((item) => !existingUris.has(item.uri));
      return newItems.length > 0 ? { ...prev, media: [...prev.media, ...newItems] } : prev;
    });
  };

  const removeMedia = (id: string) => {
    setFormData((prev) => ({ ...prev, media: prev.media.filter((item) => item.id !== id) }));
  };

  const value: IssueFormContextValue = {
    formData,
    selectCategory,
    selectSeverity,
    updateDescription,
    updateLocation,
    setSubmittedTime,
    addMedia,
    removeMedia,
  };

  return <IssueFormContext.Provider value={value}>{children}</IssueFormContext.Provider>;
}

export function useIssueFormContext(): IssueFormContextValue {
  const context = useContext(IssueFormContext);
  if (!context) {
    throw new Error('useIssueForm must be used within an IssueFormProvider');
  }
  return context;
}
