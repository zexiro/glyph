export function playCorrect(ctx, masterGain) {
  if (!ctx || ctx.state !== 'running') return

  const now = ctx.currentTime

  // First tone: 880Hz
  const gain1 = ctx.createGain()
  gain1.gain.setValueAtTime(0, now)
  gain1.gain.linearRampToValueAtTime(0.15, now + 0.01)
  gain1.gain.linearRampToValueAtTime(0, now + 0.16)
  gain1.connect(masterGain)

  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(880, now)
  osc1.connect(gain1)
  osc1.start(now)
  osc1.stop(now + 0.17)

  // Second tone: 1100Hz (major third), delayed 80ms
  const delay = 0.08
  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0, now + delay)
  gain2.gain.linearRampToValueAtTime(0.15, now + delay + 0.01)
  gain2.gain.linearRampToValueAtTime(0, now + delay + 0.16)
  gain2.connect(masterGain)

  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1100, now)
  osc2.connect(gain2)
  osc2.start(now + delay)
  osc2.stop(now + delay + 0.17)

  setTimeout(() => {
    osc1.disconnect()
    osc2.disconnect()
    gain1.disconnect()
    gain2.disconnect()
  }, 300)
}

export function playIncorrect(ctx, masterGain) {
  if (!ctx || ctx.state !== 'running') return

  const now = ctx.currentTime
  const duration = 0.15

  // Create white noise buffer
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(300, now)
  filter.Q.setValueAtTime(1, now)

  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)

  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(masterGain)

  source.start(now)
  source.stop(now + duration + 0.01)

  setTimeout(() => {
    source.disconnect()
    filter.disconnect()
    gainNode.disconnect()
  }, (duration + 0.05) * 1000)
}

export function playStreak(ctx, masterGain, recentFrequencies) {
  if (!ctx || ctx.state !== 'running') return
  if (!recentFrequencies || recentFrequencies.length === 0) return

  const now = ctx.currentTime
  const freqs = recentFrequencies.slice(-3)
  const noteSpacing = 0.06
  const release = 0.5

  freqs.forEach((freq, i) => {
    const startTime = now + i * noteSpacing

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.01)
    gainNode.gain.setValueAtTime(0.12, startTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, startTime + 0.1 + release)

    gainNode.connect(masterGain)

    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    osc.connect(gainNode)
    osc.start(startTime)
    osc.stop(startTime + 0.1 + release + 0.01)

    setTimeout(() => {
      osc.disconnect()
      gainNode.disconnect()
    }, (i * noteSpacing + 0.1 + release + 0.05) * 1000)
  })
}
