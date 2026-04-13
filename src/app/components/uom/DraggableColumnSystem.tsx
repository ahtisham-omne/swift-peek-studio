/**
 * DraggableColumnSystem — Portable, zero-dependency* column reorder primitive.
 *
 * (* only dependency: React + lucide-react for the default preview icon)
 *
 * Drop this file into any React project and wire it to any <table>.
 *
 * ## Exports
 *
 *   useColumnReorder(columns, moveColumn, scrollContainerRef, options?)
 *     → { dragState, draggedIndex, onHeaderPointerDown, previewElRef }
 *
 *   ColumnDragPreview — default floating pill (or supply your own via renderPreview)
 *
 *   ColumnDef / DragState — TypeScript interfaces
 *
 * ## How it works
 *
 *   1. Bind `onHeaderPointerDown(e, colIndex)` to each <th>.
 *   2. The hook tracks pointer movement via raw `window.addEventListener`
 *      and positions a preview element via direct DOM writes (zero React
 *      re-renders during pointer movement).
 *   3. When the cursor crosses into a neighboring column's boundary,
 *      `moveColumn(from, to)` fires and a FLIP slide animation plays
 *      on all affected <th>/<td>.
 *   4. React only re-renders on: drag start (1), column swap (1), drag end (1).
 *
 * ## Styling contract
 *
 *   The hook reads `thead th` and `tbody tr > td` from `scrollContainerRef`
 *   for FLIP position snapshots. Your table must use a standard
 *   <table><thead><tr><th>…</th></tr></thead><tbody>…</tbody></table> structure.
 *
 *   All default styling uses CSS custom properties from theme.css.
 *   Typography uses 'Inter' font family defined in fonts.css.
 */

import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import { GripVertical } from "lucide-react";

// =====================================================================
// Types
// =====================================================================

export interface DragColumnDef {
  key: string;
  label: string;
  width: number;
}

/** Lightweight drag state — no cursor coords (those live in refs). */
export interface DragState {
  key: string;
  currentIndex: number;
  width: number;
  label: string;
}

// =====================================================================
// Options
// =====================================================================

export interface ColumnReorderOptions {
  /** Minimum pointer movement (px) before drag activates. Default 3. */
  dragThreshold?: number;
  /** Width of the edge-scroll zone (px). Default 80. */
  edgeZone?: number;
  /** Max scroll speed (px/frame). Default 20. */
  maxScrollSpeed?: number;
  /** FLIP slide duration (ms). Default 150. */
  flipDuration?: number;
  /** FLIP easing. Default "cubic-bezier(0.25, 1, 0.5, 1)". */
  flipEasing?: string;
}

// =====================================================================
// Hook: useColumnReorder
// =====================================================================

export function useColumnReorder(
  columns: DragColumnDef[],
  moveColumn: (from: number, to: number) => void,
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  options?: ColumnReorderOptions
) {
  const {
    dragThreshold = 3,
    edgeZone = 80,
    maxScrollSpeed = 20,
    flipDuration = 150,
    flipEasing = "cubic-bezier(0.25, 1, 0.5, 1)",
  } = options ?? {};

  // React state — only set on drag start / swap / end
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Ref that holds the preview DOM element — positioned via direct style writes
  const previewElRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs for the tight pointer-move loop
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const moveColumnRef = useRef(moveColumn);
  moveColumnRef.current = moveColumn;
  const sessionRef = useRef<(DragState & { startX: number; startY: number }) | null>(null);
  const scrollRafRef = useRef<number | null>(null);
  const scrollSpeedRef = useRef(0);

  // ---- Swap cooldown: prevent oscillation at column boundaries ----
  const lastSwapTimeRef = useRef(0);

  // ---- FLIP snapshot ref ----
  const flipSnapshotRef = useRef<Map<string, number>>(new Map());

  // ---- Edge scroll rAF loop ----
  const startEdgeScroll = useCallback(() => {
    if (scrollRafRef.current !== null) return;
    const tick = () => {
      const el = scrollContainerRef.current;
      if (!el || scrollSpeedRef.current === 0) {
        scrollRafRef.current = null;
        return;
      }
      el.scrollLeft += scrollSpeedRef.current;
      scrollRafRef.current = requestAnimationFrame(tick);
    };
    scrollRafRef.current = requestAnimationFrame(tick);
  }, [scrollContainerRef]);

  const stopEdgeScroll = useCallback(() => {
    scrollSpeedRef.current = 0;
    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = null;
    }
  }, []);

  /** Snapshot column left positions before a swap. */
  const snapshotColumnPositions = useCallback(() => {
    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) return;
    const ths = scrollEl.querySelectorAll("thead th");
    const cols = columnsRef.current;
    const map = new Map<string, number>();
    ths.forEach((th, i) => {
      if (i < cols.length) {
        map.set(cols[i].key, (th as HTMLElement).getBoundingClientRect().left);
      }
    });
    flipSnapshotRef.current = map;
  }, [scrollContainerRef]);

  // ---- FLIP: apply after React commits a column reorder ----
  useLayoutEffect(() => {
    const snapshot = flipSnapshotRef.current;
    if (!snapshot.size) return;

    const scrollEl = scrollContainerRef.current;
    if (!scrollEl) {
      snapshot.clear();
      return;
    }

    const ths = scrollEl.querySelectorAll("thead th");
    const trs = scrollEl.querySelectorAll("tbody tr");

    type FlipEntry = { delta: number; th: HTMLElement; tds: HTMLElement[] };
    const entries: FlipEntry[] = [];

    columns.forEach((col, i) => {
      const prevLeft = snapshot.get(col.key);
      if (prevLeft === undefined) return;
      const th = ths[i] as HTMLElement | undefined;
      if (!th) return;
      const newLeft = th.getBoundingClientRect().left;
      const delta = prevLeft - newLeft;
      if (Math.abs(delta) < 0.5) return;

      const tds: HTMLElement[] = [];
      trs.forEach((tr) => {
        const td = (tr as HTMLElement).children[i] as HTMLElement | undefined;
        if (td) tds.push(td);
      });

      entries.push({ delta, th, tds });
    });

    snapshot.clear();
    if (entries.length === 0) return;

    // Invert
    entries.forEach(({ delta, th, tds }) => {
      th.style.transition = "none";
      th.style.transform = `translateX(${delta}px)`;
      tds.forEach((td) => {
        td.style.transition = "none";
        td.style.transform = `translateX(${delta}px)`;
      });
    });

    // Force reflow
    void scrollEl.offsetHeight;

    // Play
    requestAnimationFrame(() => {
      entries.forEach(({ th, tds }) => {
        th.style.transition = `transform ${flipDuration}ms ${flipEasing}`;
        th.style.transform = "";
        tds.forEach((td) => {
          td.style.transition = `transform ${flipDuration}ms ${flipEasing}`;
          td.style.transform = "";
        });
      });

      // Cleanup inline styles after animation
      setTimeout(() => {
        entries.forEach(({ th, tds }) => {
          th.style.transition = "";
          th.style.transform = "";
          tds.forEach((td) => {
            td.style.transition = "";
            td.style.transform = "";
          });
        });
      }, flipDuration + 10);
    });
  }, [columns, scrollContainerRef, flipDuration, flipEasing]);

  // ---- Pointer down — call this from your <th> ----
  const onHeaderPointerDown = useCallback(
    (e: React.PointerEvent, index: number) => {
      if (e.button !== 0) return;
      e.preventDefault();

      const col = columnsRef.current[index];
      if (!col) return;

      const startX = e.clientX;
      const startY = e.clientY;
      let activated = false;

      const pending = {
        key: col.key,
        currentIndex: index,
        width: col.width,
        label: col.label,
        startX,
        startY,
      };

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!activated) {
          if (Math.abs(dx) + Math.abs(dy) < dragThreshold) return;
          activated = true;
          sessionRef.current = { ...pending };
          setDragState({
            key: pending.key,
            currentIndex: pending.currentIndex,
            width: pending.width,
            label: pending.label,
          });
        }

        const session = sessionRef.current;
        if (!session) return;

        // Position preview pill via direct DOM write — NO React re-render
        const el = previewElRef.current;
        if (el) {
          el.style.left = `${ev.clientX + 12}px`;
          el.style.top = `${ev.clientY - 14}px`;
          el.style.display = "";
        }

        // ---- Live column reorder ----
        const scrollEl = scrollContainerRef.current;
        if (scrollEl) {
          const containerRect = scrollEl.getBoundingClientRect();
          const scrollLeft = scrollEl.scrollLeft;
          const contentX = ev.clientX - containerRect.left + scrollLeft;

          const cols = columnsRef.current;
          let accum = 0;
          for (let i = 0; i < cols.length; i++) {
            const colStart = accum;
            const colEnd = accum + cols[i].width;
            accum = colEnd;

            if (contentX >= colStart && contentX < colEnd && i !== session.currentIndex) {
              // Swap cooldown — prevent oscillation at column boundaries
              const now = performance.now();
              if (now - lastSwapTimeRef.current < flipDuration) break;
              lastSwapTimeRef.current = now;

              snapshotColumnPositions();
              moveColumnRef.current(session.currentIndex, i);
              session.currentIndex = i;
              setDragState({
                key: session.key,
                currentIndex: i,
                width: session.width,
                label: session.label,
              });
              break;
            }
          }

          // ---- Edge scrolling ----
          const distFromLeft = ev.clientX - containerRect.left;
          const distFromRight = containerRect.right - ev.clientX;

          let speed = 0;
          if (distFromLeft < edgeZone && distFromLeft >= 0) {
            const ratio = 1 - distFromLeft / edgeZone;
            speed = -(ratio * ratio * maxScrollSpeed);
          } else if (distFromRight < edgeZone && distFromRight >= 0) {
            const ratio = 1 - distFromRight / edgeZone;
            speed = ratio * ratio * maxScrollSpeed;
          }

          if (speed !== 0 && scrollSpeedRef.current === 0) {
            scrollSpeedRef.current = speed;
            startEdgeScroll();
          } else if (speed === 0 && scrollSpeedRef.current !== 0) {
            stopEdgeScroll();
          } else {
            scrollSpeedRef.current = speed;
          }
        }
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        stopEdgeScroll();
        sessionRef.current = null;
        setDragState(null);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [scrollContainerRef, startEdgeScroll, stopEdgeScroll, snapshotColumnPositions, dragThreshold, edgeZone, maxScrollSpeed, flipDuration]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopEdgeScroll();
    };
  }, [stopEdgeScroll]);

  return {
    /** Current drag state (null when idle). */
    dragState,
    /** Index of the column being dragged (null when idle). Convenience shortcut. */
    draggedIndex: dragState?.currentIndex ?? null,
    /** Bind this to your <th onPointerDown={(e) => onHeaderPointerDown(e, colIndex)}>. */
    onHeaderPointerDown,
    /** Pass this ref to <ColumnDragPreview> (or your own preview container). */
    previewElRef,
  };
}

// =====================================================================
// ColumnDragPreview — default floating pill
// =====================================================================

export interface ColumnDragPreviewProps {
  dragState: DragState | null;
  previewElRef: React.RefObject<HTMLDivElement | null>;
  /** Override default rendering. Receives the label string. */
  renderPreview?: (label: string) => React.ReactNode;
}

/**
 * Default floating preview pill that follows the cursor.
 *
 * Positioning is handled by the hook via direct DOM writes to `previewElRef` —
 * this component never re-renders during pointer movement.
 *
 * Supply `renderPreview` to fully customise the pill contents.
 */
export function ColumnDragPreview({ dragState, previewElRef, renderPreview }: ColumnDragPreviewProps) {
  if (!dragState) return null;

  return (
    <div
      ref={previewElRef}
      style={{
        position: "fixed",
        pointerEvents: "none",
        zIndex: 9999,
        left: -9999,
        top: -9999,
        display: "none",
      }}
    >
      {renderPreview ? (
        renderPreview(dragState.label)
      ) : (
        <div
          className="flex items-center gap-1.5 h-[32px] pl-2 pr-3 rounded-md whitespace-nowrap"
          style={{
            marginLeft: 12,
            marginTop: -14,
            backgroundColor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(10,119,255,0.3)",
            boxShadow: "0 1px 3px rgba(10,119,255,0.08), 0 6px 20px rgba(0,0,0,0.10)",
          }}
        >
          <GripVertical className="w-3 h-3 shrink-0" style={{ color: "#0A77FF" }} />
          <span className="text-[13px]" style={{ color: "#0A77FF", fontWeight: 500 }}>
            {dragState.label}
          </span>
        </div>
      )}
    </div>
  );
}