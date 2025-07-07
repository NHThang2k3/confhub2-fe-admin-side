// src/app/[locale]/dashboard/logAnalysis/modals/DataReviewModal/types.ts
import { Conference } from '@/src/models/logAnalysis/importConferenceCrawl';

// Xuất lại Conference để các component khác có thể import từ một nguồn
export type { Conference };

export interface DataReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any[] | null;
    isDbImport: boolean;
    onFinalize: (data: Conference[]) => void;
}