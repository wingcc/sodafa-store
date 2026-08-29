import React from 'react';

export interface TimelineConnectorProps {
  from: number;
  to: number;
  top: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TimelineConnector: React.FC<TimelineConnectorProps> = ({ 
  from, 
  to, 
  top, 
  className = '',
  style 
}) => {
  const width = Math.max(to - from, 0.5);
  
  return (
    <div
      className={`absolute z-[5] ${className}`}
      style={{
        left: `${from}%`,
        width: `${width}%`,
        top: `${top}px`,
        height: '2px',
        borderTop: '2px dashed rgba(100,116,139,0.6)',
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
};