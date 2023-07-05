import { useRef, useCallback, useEffect, RefObject } from "react"

interface ObserverProps {
  targetRef: RefObject<HTMLDivElement>,
  handler: () => Promise<any> | void,
  options: IntersectionObserverInit
}

export function useIntersectionObserver({
  targetRef,
  handler,
  options
}: ObserverProps): IntersectionObserver | null {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (!target.isIntersecting) return

    handler()
  }, [handler])

  const cleanup = useCallback(() => {
    return () => {
      if (observerRef.current && targetRef.current) {
        observerRef.current.unobserve(targetRef.current)
        observerRef.current.disconnect()
        observerRef.current = null
      }
    }
  }, [targetRef, observerRef])

  const observe = useCallback(() => {
    if (!targetRef.current) return
    if (typeof IntersectionObserver === "undefined") return

    observerRef.current = new IntersectionObserver(handleObserver, options)
    observerRef.current.observe(targetRef.current)

    return cleanup()
  }, [targetRef, handleObserver, options])

  useEffect(() => {
    return observe()
  }, [observe, targetRef])

  return observerRef.current
}
