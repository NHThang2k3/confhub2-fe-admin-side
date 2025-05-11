// src/types.ts

// Assuming status is uppercase: 'PENDING', 'APPROVED', 'REJECTED'
export type ConferenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all'; // Add 'all' for filter state

// SortKey uses fields that are either on the request or the main conference object
export type SortKey = 'createdAt' | 'updatedAt' | 'title';
export type SortDirection = 'asc' | 'desc';

// Define structure for nested objects from the /conference/{id} API
export interface Location {
    address?: string | null;
    cityStateProvince?: string | null;
    country?: string | null;
    continent?: string | null;
}

// --- MODIFIED ---
// Define ConferenceDate with Date objects
export interface ConferenceDate {
    fromDate: Date; // <--- CHANGED to Date
    toDate: Date; // <--- CHANGED to Date
    type: string | null;
    name: string | null;
}

// --- MODIFIED ---
// Define Organization with ConferenceDate objects
export interface Organization {
    id: string;
    isAvailable: boolean;
    createdAt: string; // Still string from API response for organization itself
    updatedAt: string; // Still string from API response for organization itself
    conferenceId: string;
    year: number | null;
    accessType: string | null;
    summary: string | null;
    callForPaper: string | null;
    link: string | null;
    impLink: string | null;
    cfpLink: string | null;
    summerize: string | null;
    publisher: string | null;
    locations: Location[] | null; // Allow null based on example structure
    topics: string[] | null; // Array of topic strings, allow null
    conferenceDates: ConferenceDate[] | null; // Array of ConferenceDate objects, allow null
    // Add other fields from organization if needed
}


// Define the structure of the Conference object used in the frontend
// This combines fields from the API's ApiConferenceRequest and the full conference details API
export interface Conference {
    // Fields from the /admin-conference/requests API response (the request itself)
    id: string; // The ID of the *request* (used for moderation actions and list key)
    conferenceId: string; // The ID of the actual conference (used to fetch details)
    userId: string; // ID of the user who made the request
    adminId: string | null; // ID of the admin who acted
    status: ConferenceStatus; // Status of the request ('PENDING', 'APPROVED', 'REJECTED')
    message: string | null; // User's original message

    // Use Date objects after mapping
    createdAt: Date; // Converted from request's ISO string
    updatedAt: Date; // Converted from request's ISO string

    // Fields from the /conference/{id} API response (full conference details)
    // These are now merged directly into the Conference object after fetching
    title: string; // From the conference details response
    acronym: string | null; // From the conference details response
    creatorId: string; // From the conference details response

    // Nested arrays/objects from the /conference/{id} API - Use the updated Organization type
    organizations: Organization[] | null; // Array of Organization objects, allow null
    ranks: any[] | null; // Allow null or empty array
    feedbacks: any[] | null; // Allow null or empty array
    followBy: any[] | null; // Allow null or empty array

    // Add a field to indicate if details fetching failed for this item
    detailsFetchError?: string | null;

    // Client-side managed fields (if needed)
    comment?: string; // Optional: Admin's comment/reason (still client-side)
}

// Helper type for dates returned as strings from nested objects (raw API response)
export interface ConferenceDateStrings {
    fromDate: string; // Still string from API
    toDate: string; // Still string from API
    type: string | null;
    name: string | null;
}

// Helper type for organizations with date strings (raw API response structure)
export interface OrganizationStrings {
     id: string;
     isAvailable: boolean;
     createdAt: string;
     updatedAt: string;
     conferenceId: string;
     year: number | null;
     accessType: string | null;
     summary: string | null;
     callForPaper: string | null;
     link: string | null;
     impLink: string | null;
     cfpLink: string | null;
     summerize: string | null;
     publisher: string | null;
     locations: Location[] | null;
     topics: string[] | null;
     conferenceDates: ConferenceDateStrings[] | null; // Dates are strings here
}

// API response structure for GET /conference/{id}
export interface FullConferenceDetailsResponse {
    id: string; // This is the CONFERENCE ID
    title: string;
    acronym: string | null;
    creatorId: string;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    status: string; // Status might be duplicated here
    ranks: any[] | null;
    organizations: OrganizationStrings[] | null; // Dates are strings here
    feedbacks: any[] | null;
    followBy: any[] | null;
    // Add other top-level fields from this API if any
}

// API response structure for GET /admin-conference/requests
interface RequestConferenceDetails {
    id: string; // Nested conference ID
    title: string;
    acronym: string | null;
}

export interface ApiConferenceRequest {
    id: string; // This is the REQUEST ID
    conferenceId: string; // The actual conference ID
    userId: string;
    adminId: string | null;
    status: ConferenceStatus; // 'PENDING', 'APPROVED', 'REJECTED'
    message: string | null;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    conference: RequestConferenceDetails | null; // Nested object with limited details
    user: any | null; // User object
    admin: any | null; // Admin object
}