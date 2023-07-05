import { renderHook, act } from '@testing-library/react'
import { useIntersectionObserver } from '../useIntersectionObserver'

describe('useIntersectionObserver null cases', () => {
  it('should return null when targetRef is null', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({
        targetRef: { current: null },
        handler: jest.fn(),
        options: {}
      })
    )

    expect(result.current).toBeNull()
  })

  it('should return null when IntersectionObserver is not supported', () => {
    const { result } = renderHook(() =>
      useIntersectionObserver({
        targetRef: { current: document.createElement('div') },
        handler: jest.fn(),
        options: {}
      })
    )

    expect(result.current).toBeNull()
  })
})

describe('useIntersectionObserver truthy cases', () => {
  let targetRef: HTMLDivElement
  let observe: jest.Mock
  let unobserve: jest.Mock
  let disconnect: jest.Mock
  let handler = jest.fn()

  beforeAll(() => {
    targetRef = document.createElement('div')

    Object.assign(window, {
      IntersectionObserver: jest.fn(() => ({
        observe: jest.fn((target: Element) => {
          observe(target)
        }),
        unobserve,
        disconnect,
      })),
    })
  })

  afterAll(() => {
    observe.mockReset()
    unobserve.mockReset()
    disconnect.mockReset()
  })

  beforeEach(() => {
    observe = jest.fn((target: Element) => handler([
      { target, isIntersecting: true }
    ]))
    unobserve = jest.fn()
    disconnect = jest.fn()
  })

  it('should register an IntersectionObserver and observe intersections', () => {
    handler = jest.fn()

    renderHook(() =>
      useIntersectionObserver({
        targetRef: { current: targetRef },
        handler,
        options: {},
      })
    )

    expect(window.IntersectionObserver).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledTimes(1)
    expect(observe).toHaveBeenCalledWith(targetRef)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should cleanup an IntersectionObserver when unmounted', () => {
    const { result, unmount } = renderHook(() =>
      useIntersectionObserver({
        targetRef: { current: targetRef },
        handler: jest.fn(),
        options: {}
      })
    )

    unmount()

    expect(unobserve).toHaveBeenCalledTimes(1)
    expect(disconnect).toHaveBeenCalledTimes(1)
    expect(result.current).toBeNull()
  })
})