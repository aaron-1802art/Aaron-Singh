import { useState, useRef, useCallback } from "react";

interface DragOffset {
  x: number;
  y: number;
}

export function useDraggable() {
  const [offset, setOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialOffsetRef = useRef<DragOffset>({ x: 0, y: 0 });
  const hasMovedPastThresholdRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLElement>) => {
    // Only drag with primary mouse button; disable for touch pointers to protect mobile scrolling
    if (e.pointerType === "touch" || e.button !== 0) {
      return;
    }

    activePointerIdRef.current = e.pointerId;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialOffsetRef.current = { ...offset };
    hasMovedPastThresholdRef.current = false;
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Safe fallback if pointer capture fails
    }
  }, [offset]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (activePointerIdRef.current !== e.pointerId || !isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const distance = Math.hypot(dx, dy);

    // 6px threshold check
    if (distance > 6) {
      hasMovedPastThresholdRef.current = true;
      setOffset({
        x: initialOffsetRef.current.x + dx,
        y: initialOffsetRef.current.y + dy,
      });
    }
  }, [isDragging]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (activePointerIdRef.current === e.pointerId) {
      setIsDragging(false);
      activePointerIdRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe catch
      }
    }
  }, []);

  const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // If movement exceeded 6px, suppress navigation!
    if (hasMovedPastThresholdRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedPastThresholdRef.current = false;
    }
  }, []);

  return {
    offset,
    isDragging,
    hasDragged: hasMovedPastThresholdRef.current,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onClick,
    },
  };
}

