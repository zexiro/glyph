let instance = null

export function getAudioEngine() {
  if (instance) return instance

  let ctx = null
  let masterGain = null

  function init() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume()
      return
    }
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    masterGain = ctx.createGain()
    masterGain.gain.value = 0.6
    masterGain.connect(ctx.destination)
  }

  function setVolume(vol) {
    if (masterGain) masterGain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.1)
  }

  function pause() { if (ctx?.state === 'running') ctx.suspend() }
  function resume() { if (ctx?.state === 'suspended') ctx.resume() }

  instance = {
    init,
    setVolume,
    pause,
    resume,
    get context() { return ctx },
    get master() { return masterGain },
  }

  // Handle tab visibility
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (ctx && document.visibilityState === 'visible' && ctx.state === 'suspended') ctx.resume()
    })
  }

  return instance
}
