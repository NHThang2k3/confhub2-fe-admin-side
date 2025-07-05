// FILE: /utils/types.ts

export interface Conference {
  id: string;
  title: string;
  acronym: string;
  sources: string[];
  researchFields: string[];
  ranks: string[];
  status: string;
  createdAt: string;
  updatedAt:string;
  organizationHistory: Organization[];
}

export interface Organization {
  id: string;
  year: number;
  accessType: string;
  isAvailable: boolean;
  publisher: string;
  summerize: string;
  callForPaper: string;
  link: string;
  cfpLink: string;
  impLink: string;
  locations: Location[];
  topics: string[];
  dates: ConferenceDate[];
  updatedAt: string;
}

export interface Location {
  address: string;
  cityStateProvince: string;
  country: string;
  continent: string;
}

export interface ConferenceDate {
  type: string;
  startDate: string;
  endDate: string;
  name: string;
}

export interface PaginationMeta {
  total: number;
  lastPage: number;
  currentPage: number;
  perPage: number;
  prev: number | null;
  next: number | null;
}

export interface PaginationResponse {
  data: Conference[];
  meta: PaginationMeta;
}

export interface FilterState {
  search: string;
  status: string;
  source: string;
  researchFields: string;
  rank: string;
}

export interface FilterOptions {
  status: string[];
  sources: string[];
  researchFields: string[];
  ranks: string[];
}