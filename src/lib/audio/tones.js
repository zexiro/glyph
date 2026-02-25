const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]

export function playGlyphTone(ctx, masterGain, glyphIndex, duration = 0.4) {
  if (!ctx || ctx.state !== 'running') return null

  const freq = PENTATONIC[glyphIndex % PENTATONIC.length]
  const now = ctx.currentTime
  const attack = 0.02
  const decay = 0.1
  const sustainLevel = 0.3
  const release = 0.3

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.4, now + attack)
  gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay)
  gainNode.gain.setValueAtTime(sustainLevel, now + duration)
  gainNode.gain.linearRampToValueAtTime(0, now + duration + release)
  gainNode.connect(masterGain)

  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(freq, now)
  osc1.detune.setValueAtTime(3, now)
  osc1.connect(gainNode)

  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(freq, now)
  osc2.detune.setValueAtTime(-3, now)
  osc2.connect(gainNode)

  osc1.start(now)
  osc2.start(now)

  const stopTime = now + duration + release + 0.01
  osc1.stop(stopTime)
  osc2.stop(stopTime)

  // Cleanup after oscillators finish
  setTimeout(() => {
    osc1.disconnect()
    osc2.disconnect()
    gainNode.disconnect()
  }, (duration + release + 0.05) * 1000)

  return freq
}
