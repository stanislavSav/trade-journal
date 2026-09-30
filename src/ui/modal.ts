// While any sheet is open: freeze the page behind it and make it inert.
// position:fixed (not just overflow:hidden) is what stops iOS Safari from scrolling the body.
let locks = 0
let savedY = 0

export function lockPage(): () => void {
  if (locks++ === 0) {
    savedY = window.scrollY
    const s = document.body.style
    s.position = 'fixed'
    s.top = `-${savedY}px`
    s.left = '0'
    s.right = '0'
    document.getElementById('root')?.setAttribute('inert', '')
  }
  let released = false
  return () => {
    if (released) return
    released = true
    if (--locks > 0) return
    const s = document.body.style
    s.position = ''
    s.top = ''
    s.left = ''
    s.right = ''
    document.getElementById('root')?.removeAttribute('inert')
    window.scrollTo(0, savedY)
  }
}

// Escape closes only the topmost sheet.
const stack: object[] = []

export function pushLayer(token: object): () => void {
  stack.push(token)
  return () => {
    const i = stack.lastIndexOf(token)
    if (i >= 0) stack.splice(i, 1)
  }
}

export function isTopLayer(token: object): boolean {
  return stack[stack.length - 1] === token
}
