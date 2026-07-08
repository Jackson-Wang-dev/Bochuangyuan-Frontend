import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

type RevealVariant = 'up' | 'scale' | 'left' | 'right'

const hiddenClass: Record<RevealVariant, string> = {
  up: 'reveal-hidden',
  scale: 'reveal-hidden-scale',
  left: 'reveal-hidden-left',
  right: 'reveal-hidden-right',
}

const visibleClass: Record<RevealVariant, string> = {
  up: 'reveal-visible',
  scale: 'reveal-visible-scale',
  left: 'reveal-visible-left',
  right: 'reveal-visible-right',
}

interface ScrollRevealProps {
  children: ReactNode
  variant?: RevealVariant
  className?: string
  delay?: number
  stagger?: boolean
}

export function ScrollReveal({
  children,
  variant = 'up',
  className = '',
  delay = 0,
  stagger = false,
}: ScrollRevealProps) {
  const { ref, isInView } = useInView<HTMLDivElement>({
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  })

  const delayStyle = delay > 0 ? { animationDelay: `${delay}ms` } : undefined

  return (
    <div
      ref={ref}
      className={`${isInView ? visibleClass[variant] : hiddenClass[variant]} ${stagger && isInView ? 'stagger-children' : ''} ${className}`}
      style={delayStyle}
    >
      {children}
    </div>
  )
}
