'use client';

import React from 'react';
import { GripVertical } from 'lucide-react';

interface ResizeHandlesProps {
  visible: boolean;
  onResizeStart: (handle: 'bottom-left' | 'bottom-center' | 'bottom-right', e: React.PointerEvent) => void;
}

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ visible, onResizeStart }) => {
  if (!visible) return null;

  return (
    <>
      {/* Bottom-Left Handle — resize width + height */}
      <div
        className="absolute bottom-0 left-0 z-30 resize-handle-corner"
        onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation(); onResizeStart('bottom-left', e); }}
      >
        <div className="resize-handle-dot group pointer-events-none">
          <GripVertical size={10} className="resize-handle-icon" />
        </div>
      </div>

      {/* Bottom-Center Handle — resize height only */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 resize-handle-center"
        onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation(); onResizeStart('bottom-center', e); }}
      >
        <div className="resize-handle-line group pointer-events-none" />
      </div>

      {/* Bottom-Right Handle — resize width + height */}
      <div
        className="absolute bottom-0 right-0 z-30 resize-handle-corner"
        onPointerDown={e => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation(); onResizeStart('bottom-right', e); }}
      >
        <div className="resize-handle-dot group pointer-events-none">
          <GripVertical size={10} className="resize-handle-icon" />
        </div>
      </div>
    </>
  );
};

export default ResizeHandles;
