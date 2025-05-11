// src/utils/moderationHelpers.ts

import { ConferenceStatus } from '@/src/types';

export const getStatusColorClass = (status: ConferenceStatus): string => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'rejected':
        return 'text-red-700 bg-red-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
};

export const getStatusBgClass = (status: ConferenceStatus): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-50';
      case 'rejected':
        return 'bg-red-50';
      case 'pending':
        return 'bg-yellow-50';
      default:
        return 'bg-white';
    }
};