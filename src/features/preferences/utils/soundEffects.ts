let audioCtx: AudioContext | null = null

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

export const playCorrectSound = () => {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
    osc.frequency.setValueAtTime(523, ctx.currentTime)
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  } catch {
    // audio not supported
  }
}

export const playIncorrectSound = () => {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sawtooth'
    gain.gain.setValueAtTime(0.1, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.frequency.setValueAtTime(180, ctx.currentTime)
    osc.frequency.setValueAtTime(120, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch {
    // audio not supported
  }
}
