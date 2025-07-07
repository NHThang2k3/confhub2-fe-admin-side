// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/constants.ts
export const ALL_FIELDS = ["Title", "Acronym", "Source", "Rank", "Field Of Research 1", "Field Of Research 2", "Field Of Research 3"];
export const REQUIRED_FIELDS = ["Title", "Acronym"];
export const OPTIONAL_FIELDS = ALL_FIELDS.filter(f => !REQUIRED_FIELDS.includes(f));