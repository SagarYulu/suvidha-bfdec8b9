
import React from 'react';

export const SENTIMENT_COLORS = {
  happy: '#10B981',    // Green
  neutral: '#F59E0B',  // Amber
  sad: '#EF4444',      // Red
};

export const CURVED_LINE_TYPE = "monotone" as const;

export const formatTooltipValue = (value: number, name: string) => {
  return [`${value}`, name];
};

export const formatAxisLabel = (value: string) => {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const getColorByIndex = (index: number) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  return colors[index % colors.length];
};
