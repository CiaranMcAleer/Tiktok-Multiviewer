import { useEffect, useState, useRef } from "react"

/**
 * useWidgetVisibility
 * Returns true if the element is in (or near) the viewport.
 * @param options IntersectionObserver options (rootMargin, threshold)
 */
export function useWidgetVisibility(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let observer: IntersectionObserver | null = null
    observer = new window.IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: options?.rootMargin || "0px",
        threshold: options?.threshold ?? 0.5, // 50% visible by default
      }
    )
    observer.observe(element)

    return () => {
      if (observer && element) observer.unobserve(element)
      observer?.disconnect()
    }
  }, [options])

  return [ref, isVisible] as const
}
