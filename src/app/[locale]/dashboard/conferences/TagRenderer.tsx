// FILE: /components/shared/TagRenderer.tsx

import React from 'react';

interface TagRendererProps {
  value: string;
  color: string;
}

export const TagRenderer = ({ value, color }: TagRendererProps) => (
  <span className={`px-2 py-1 rounded text-sm ${color}`}>
    {value}
  </span>
);