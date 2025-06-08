// src/hooks/crawl/constants.ts
import { appConfig } from '@/src/middleware';

export const API_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-conferences`;
export const UPLOAD_FILE_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/upload-file-csv`;
export const MAX_ITEMS_PER_CRAWL_REQUEST = 50;


export const API_DB_CHECK_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/journals/check-import`;
export const API_BACKEND_CRAWL_ENDPOINT = `${appConfig.NEXT_PUBLIC_BACKEND_URL}/api/v1/crawl-journals`;