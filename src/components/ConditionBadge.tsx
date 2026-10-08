import React from 'react';
import { ConditionGrade } from '../types';
import { Sparkles, CheckCircle2, ShieldAlert, Tag } from 'lucide-react';

interface ConditionBadgeProps {
  condition: ConditionGrade;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
  condition,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-1.5 font-semibold',
  }[size];

  switch (condition) {
    case 'New/Sealed':
      return (
        <span
          className={`inline-flex items-center font-medium whitespace-nowrap rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}
        >
          {showIcon && <Sparkles className="w-3 h-3 text-blue-600" />}
          <span>New / Sealed</span>
        </span>
      );

    case 'Like New':
      return (
        <span
          className={`inline-flex items-center font-medium whitespace-nowrap rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          <span>Like New</span>
        </span>
      );

    case 'Good':
      return (
        <span
          className={`inline-flex items-center font-medium whitespace-nowrap rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}
        >
          {showIcon && <Tag className="w-3 h-3 text-amber-600" />}
          <span>Good</span>
        </span>
      );

    case 'Fair':
      return (
        <span
          className={`inline-flex items-center font-medium whitespace-nowrap rounded-md bg-orange-50 text-orange-800 border border-orange-200 ${sizeClasses}`}
        >
          {showIcon && <ShieldAlert className="w-3 h-3 text-orange-600" />}
          <span>Fair</span>
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-md bg-gray-100 text-gray-700 border border-gray-200 ${sizeClasses}`}>
          {condition}
        </span>
      );
  }
};
