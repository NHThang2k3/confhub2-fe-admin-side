// src/types.ts

export type ConferenceStatus = 'pending' | 'approved' | 'rejected';

export interface Conference {
  id: string; // Unique ID for the conference
  name: string;
  acronym: string;
  link?: string; // Optional link
  type: string;
  address?: string; // Optional address
  continent?: string; // Optional continent
  country: string;
  stateProvince?: string; // Optional state/province
  importantDates: {
    conferenceDates: string; // e.g., "2025-05-21 - 2025-05-31"
    submissionDateRound1?: string; // Optional submission date (YYYY-MM-DD format preferred)
    // Add other date types if needed
  };
  topics: string[]; // Array of topics
  description?: string; // Optional description
  status: ConferenceStatus; // Status for moderation
  comment?: string; // Optional comment for moderation
  createdAt: Date; // Timestamp when the conference was added
}

// Add types for sorting
export type SortKey = 'name' | 'createdAt' | null;
export type SortDirection = 'asc' | 'desc';