import { useRef, useEffect, useState, type ReactNode } from 'react'

type CarouselProps = {
  children: ReactNode
  /** Auto-scroll speed in pixels per second. */
  speed?: number
  /** Auto-scroll direction: 'left' moves items leftward, 'right' rightward. */
  direction?: 'left' | 'right'
}

// Horizontal, click-and-drag carousel with a seamless auto-scrolling marquee.
// Click anywhere on the strip and move the mouse left/right to scroll it. The
// track is duplicated so scrolling can loop without a visible jump; the
// auto-scroll pauses while hovering or dragging and respects reduced-motion.
// Touch devices use native momentum scrolling; a drag past a small threshold
// suppresses the trailing click so dragging over a card doesn't navigate.
function Carousel({ children, speed = 40, direction = 'left' }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const track1Ref = useRef<HTMLDivElement>(null)
  const track2Ref = useRef<HTMLDivElement>(null)
  const [loop, setLoop] = useState(false)

  const dragging = useRef(false)
  const moved = useRef(false)
  const hovering = useRef(false)
  const startX = useRef(0)
  const startScroll = useRef(0)
  const pointerId = useRef<number | null>(null)

  // Only enable the duplicated track + auto-scroll when content overflows.
  useEffect(() => {
    const el = scrollRef.current
    const track = track1Ref.current
    if (!el || !track) return
    const update = () => setLoop(track.scrollWidth > el.clientWidth + 1)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    ro.observe(track)
    return () => ro.disconnect()
  }, [children])

  // Distance from the start of the first track to the start of its duplicate —
  // the point at which we can reset scrollLeft for a seamless loop.
  function loopDistance() {
    const a = track1Ref.current
    const b = track2Ref.current
    if (!a || !b) return 0
    return b.offsetLeft - a.offsetLeft
  }

  // Keep the scroll position parked in the middle copy so there's a full copy
  // of runway on both sides — the browser clamps scrollLeft at 0 and at the max,
  // and staying centered means we never reach either edge (which is what made
  // dragging left get stuck).
  function wrap(el: HTMLDivElement) {
    const d = loopDistance()
    if (d <= 0) return
    const max = el.scrollWidth - el.clientWidth
    const center = (max - d) / 2
    if (el.scrollLeft < center) el.scrollLeft += d
    else if (el.scrollLeft >= center + d) el.scrollLeft -= d
  }

  // Start in the middle copy once the loop (and its extra tracks) exist.
  useEffect(() => {
    const el = scrollRef.current
    if (!loop || !el) return
    el.scrollLeft = loopDistance()
  }, [loop])

  useEffect(() => {
    if (!loop) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dir = direction === 'right' ? -1 : 1
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      const el = scrollRef.current
      if (el && !dragging.current && !hovering.current) {
        el.scrollLeft += dir * speed * dt
        wrap(el)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loop, speed, direction])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    // Let touch/pen use native scrolling; only hijack mouse drags.
    if (e.pointerType !== 'mouse') return
    const el = scrollRef.current
    if (!el) return
    pointerId.current = e.pointerId
    dragging.current = false
    moved.current = false
    startX.current = e.clientX
    startScroll.current = el.scrollLeft
    // Note: capture is deferred until an actual drag begins — capturing on a
    // plain click would retarget the click to this container and stop the card
    // Link from navigating.
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return
    const el = scrollRef.current
    if (!el) return
    const dx = e.clientX - startX.current
    if (!dragging.current) {
      if (Math.abs(dx) <= 5) return // below threshold: still a potential click
      dragging.current = true
      moved.current = true
      el.setPointerCapture(e.pointerId)
    }
    el.scrollLeft = startScroll.current - dx
    if (loop) wrap(el)
  }

  function endDrag(e: React.PointerEvent<HTMLDivElement>) {
    if (pointerId.current !== e.pointerId) return
    pointerId.current = null
    if (dragging.current) {
      dragging.current = false
      scrollRef.current?.releasePointerCapture(e.pointerId)
    }
  }

  // Runs in the capture phase (before the card's own click), so a drag can
  // cancel the navigation a Link would otherwise trigger.
  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (moved.current) {
      e.preventDefault()
      e.stopPropagation()
      moved.current = false
    }
  }

  return (
    <div
      ref={scrollRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onDragStart={e => e.preventDefault()}
      onPointerEnter={() => { hovering.current = true }}
      onPointerLeave={() => { hovering.current = false }}
      className="flex gap-3 overflow-x-auto py-2 cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div ref={track1Ref} className="flex gap-3 shrink-0">
        {children}
      </div>
      {loop && (
        <>
          <div ref={track2Ref} aria-hidden className="flex gap-3 shrink-0">
            {children}
          </div>
          <div aria-hidden className="flex gap-3 shrink-0">
            {children}
          </div>
        </>
      )}
    </div>
  )
}

export default Carousel
