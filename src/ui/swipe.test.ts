import { describe, expect, it } from 'vitest'
import { completesBack, swipeIntent } from './swipe'

describe('swipeIntent', () => {
  it('waits until the finger has moved a little', () => {
    expect(swipeIntent(4, 3)).toBe('pending')
  })

  it('is a back swipe when moving mostly to the right', () => {
    expect(swipeIntent(20, 5)).toBe('back')
  })

  it('is not a back swipe when scrolling vertically or moving left', () => {
    expect(swipeIntent(8, 30)).toBe('none')
    expect(swipeIntent(-20, 0)).toBe('none')
  })

  it('treats a diagonal drag as scrolling', () => {
    expect(swipeIntent(15, 15)).toBe('none')
  })
})

describe('completesBack', () => {
  it('goes back when dragged past a third of the width', () => {
    expect(completesBack(140, 390, 0)).toBe(true)
    expect(completesBack(120, 390, 0)).toBe(false)
  })

  it('goes back on a quick flick even if the drag was short', () => {
    expect(completesBack(40, 390, 0.6)).toBe(true)
  })

  it('does not go back on a tiny twitch, however fast', () => {
    expect(completesBack(10, 390, 2)).toBe(false)
  })
})
