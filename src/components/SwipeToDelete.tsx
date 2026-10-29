import { useRef, useState } from 'react';
import type { MouseEvent, PointerEvent, ReactNode } from 'react';
import { useI18n } from '../i18n';
import { assets } from './icons';
import { cx } from './ui';

/** Width of the revealed delete area (Figma "Slide": card shifted 129px left). */
const OPEN = 129;
const DRAG_START = 8;

/** Dragging past this share of the card width and releasing deletes it (the card slides all the way out). */
const FULL_SWIPE = 0.5;
const EXIT_MS = 200;

/**
 * Slide-to-delete wrapper: drag the content left to reveal the red delete area.
 * - release past ~half of the card: it slides all the way out and is deleted
 * - release past half of the red area: stays open (tap the red area to delete, tap the content to close)
 * - otherwise it snaps back
 */
export function SwipeToDelete({
  children,
  onDelete,
  label,
  framed,
}: {
  children: ReactNode;
  onDelete: () => void;
  label: string;
  /** keep the green "selected" border fixed on the wrapper while the content slides inside it */
  framed?: boolean;
}) {
  const { rtl } = useI18n();
  /** physical direction of the swipe: left in LTR, right in RTL (logical x stays negative while open) */
  const dir = rtl ? -1 : 1;
  const [x, setXState] = useState(0);
  const xRef = useRef(0);
  const setX = (v: number) => {
    xRef.current = v;
    setXState(v);
  };
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; base: number; id: number } | null>(null);
  const moved = useRef(false);

  const onDown = (e: PointerEvent) => {
    start.current = { x: e.clientX, base: xRef.current, id: e.pointerId };
    moved.current = false;
  };
  const onMove = (e: PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const delta = (e.clientX - s.x) * dir;
    if (!moved.current && Math.abs(delta) > DRAG_START) {
      moved.current = true;
      setDragging(true);
      (e.currentTarget as HTMLElement).setPointerCapture(s.id);
    }
    if (moved.current) setX(Math.max(-(wrapRef.current?.offsetWidth ?? OPEN), Math.min(0, s.base + delta)));
  };
  const remove = (width = wrapRef.current?.offsetWidth ?? OPEN) => {
    setLeaving(true);
    setX(-width);
    setTimeout(onDelete, EXIT_MS);
  };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    if (moved.current) {
      const width = wrapRef.current?.offsetWidth ?? OPEN;
      setDragging(false);
      const cur = xRef.current;
      if (cur < -width * FULL_SWIPE) {
        remove(width);
      } else {
        setX(cur < -OPEN / 2 ? -OPEN : 0);
      }
      // swallow the click that follows a drag
      setTimeout(() => (moved.current = false), 0);
    }
  };
  const onClickCapture = (e: MouseEvent) => {
    if (moved.current) {
      e.stopPropagation();
      e.preventDefault();
    } else if (x !== 0) {
      e.stopPropagation();
      e.preventDefault();
      setX(0);
    }
  };

  const open = x < 0;

  return (
    <div className={cx('loc-swipe', framed && 'loc-swipe--framed', open && 'loc-swipe--open')} ref={wrapRef}>
      <button
        type="button"
        className="loc-swipe__action"
        aria-label={label}
        tabIndex={open ? 0 : -1}
        style={{ visibility: open ? 'visible' : 'hidden', width: Math.max(OPEN, -x) }}
        disabled={leaving}
        onClick={() => remove()}
      >
        <img src={assets.deleteIcon} alt="" />
      </button>
      <div
        className={cx('loc-swipe__content', !dragging && 'loc-swipe__content--settle')}
        style={{ transform: x ? `translateX(${x * dir}px)` : undefined }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
    </div>
  );
}
