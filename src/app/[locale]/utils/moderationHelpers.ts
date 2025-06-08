// src/utils/moderationHelpers.ts

import { ConferenceStatus } from '@/src/types';

export const getStatusColorClass = (status: ConferenceStatus): string => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-700 bg-green-100';
      case 'REJECTED':
        return 'text-red-700 bg-red-100';
      case 'PENDING':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
};

export const getStatusBgClass = (status: ConferenceStatus): string => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50';
      case 'REJECTED':
        return 'bg-red-50';
      case 'PENDING':
        return 'bg-yellow-50';
      default:
        return 'bg-white-pure';
    }
};