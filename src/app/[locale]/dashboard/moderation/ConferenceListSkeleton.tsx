// src/components/Moderation/ConferenceListSkeleton.tsx
import React from 'react';

const SkeletonItem = () => (
    <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex animate-pulse items-center justify-between gap-4">
            <div className="flex-1 space-y-3">
                <div className="h-4 rounded bg-slate-200"></div>
                <div className="h-3 w-3/4 rounded bg-slate-200"></div>
            </div>
            <div className="h-6 w-24 rounded-full bg-slate-200"></div>
            <div className="h-5 w-5 rounded-full bg-slate-200"></div>
        </div>
    </div>
);

export const ConferenceListSkeleton = () => (
    <div className="space-y-4">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
    </div>
);