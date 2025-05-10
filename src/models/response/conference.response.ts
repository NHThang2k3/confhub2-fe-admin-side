export type ConferenceDetailsListResponse = {
  payload: ConferenceResponse[];
  meta: Meta;
};

export type ConferenceResponse = {
  id: string;
  title: string;
  acronym: string;
  creatorId: string | null;
  adminId: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  ranks: {
    year: number;
    rank: string;
    source: string;
    fieldOfResearch: string;
  }[];
  organizations: {
    id: string;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
    conferenceId: string;
    year: number;
    accessType: string;
    summary: string;
    callForPaper: string;
    link: string;
    impLink: string;
    cfpLink: string;
    summerize: string;
    publisher: string;
    locations: {
      address: string;
      cityStateProvince: string;
      country: string;
      continent: string;
    }[];
    topics: string[];
    conferenceDates: {
      fromDate: string;
      toDate: string;
      type: string;
      name: string;
    }[];
  }[];
  feedbacks: any[];
  followBy: any[];
};

export type ConferenceIdentity = {
  id: string;
  title: string | null;
  acronym: string | null;
  creatorId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Organization = {
  id: string;
  year: number | null;
  accessType: string | null;
  isAvailable: boolean | null;
  conferenceId: string | null;
  summerize: string | null;
  callForPaper: string | null;
  publisher: string | null;
  link: string | null;
  cfpLink: string | null;
  impLink: string | null;
  topics: string[] | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ImportantDate = {
  fromDate: string | null;
  toDate: string | null;
  type: string | null;
  name: string | null;
} | null;

export type Location = {
  id: string;
  address: string | null;
  cityStateProvince: string | null;
  country: string | null;
  continent: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isAvailable: boolean | null;
  organizeId: string | null;
};

export type Rank = {
  rank: string;
  source: string | null;
  fieldOfResearch: string | null;
};

export type Feedback = {
  id: string;
  organizedId: string;
  creatorId: string;
  firstName: string;
  lastName: string;
  avatar: string;
  description: string;
  star: number;
  createdAt: string;
  updatedAt: string;
};

export type FollowerInfo = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string;
  createdAt: string | null;
  updatedAt: string | null;
};



export type Meta = {
  curPage: number;
  perPage: number;
  totalPage: number;
  prevPage: number | null;
  nextPage: number | null;
  totalItems: number;
};