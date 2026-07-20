class AmbientAudioEngine {
  constructor() {
    this.context = null
    this.master = null
    this.channels = new Map()
  }

  async ensureContext() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) throw new Error('当前浏览器不支持环境音')
      this.context = new AudioContext()
      this.master = this.context.createGain()
      this.master.gain.value = 0.72
      this.master.connect(this.context.destination)
    }
    if (this.context.state === 'suspended') await this.context.resume()
    return this.context
  }

  createNoiseBuffer(kind) {
    const length = this.context.sampleRate * 5
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1
      if (kind === 'brown') {
        last = (last + 0.025 * white) / 1.025
        data[i] = last * 3.2
      } else if (kind === 'pink') {
        last = last * 0.86 + white * 0.14
        data[i] = last * 1.8
      } else {
        data[i] = white * 0.72
      }
    }
    return buffer
  }

  async buildChannel(id) {
    await this.ensureContext()
    if (this.channels.has(id)) return this.channels.get(id)

    const presets = {
      rain: { noise: 'white', type: 'bandpass', frequency: 4200, q: 0.45, depth: 0.05, rate: 0.18 },
      ocean: { noise: 'brown', type: 'lowpass', frequency: 900, q: 0.65, depth: 0.38, rate: 0.1 },
      fire: { noise: 'pink', type: 'bandpass', frequency: 1500, q: 0.7, depth: 0.2, rate: 2.7 },
      forest: { noise: 'pink', type: 'bandpass', frequency: 2700, q: 0.35, depth: 0.13, rate: 0.27 },
      wind: { noise: 'brown', type: 'bandpass', frequency: 720, q: 0.5, depth: 0.28, rate: 0.07 },
      cafe: { noise: 'pink', type: 'lowpass', frequency: 1250, q: 0.25, depth: 0.08, rate: 0.35 },
    }
    const preset = presets[id] || presets.rain
    const source = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    const motionGain = this.context.createGain()
    const channelGain = this.context.createGain()
    const lfo = this.context.createOscillator()
    const lfoGain = this.context.createGain()

    source.buffer = this.createNoiseBuffer(preset.noise)
    source.loop = true
    filter.type = preset.type
    filter.frequency.value = preset.frequency
    filter.Q.value = preset.q
    motionGain.gain.value = 0.65
    channelGain.gain.value = 0
    lfo.frequency.value = preset.rate
    lfoGain.gain.value = preset.depth

    source.connect(filter).connect(motionGain).connect(channelGain).connect(this.master)
    lfo.connect(lfoGain).connect(motionGain.gain)
    source.start()
    lfo.start()
    const channel = { source, lfo, gain: channelGain }
    this.channels.set(id, channel)
    return channel
  }

  async setChannel(id, enabled, volume) {
    const channel = await this.buildChannel(id)
    const now = this.context.currentTime
    channel.gain.gain.cancelScheduledValues(now)
    channel.gain.gain.setTargetAtTime(enabled ? volume : 0, now, 0.08)
  }

  setMaster(muted) {
    if (!this.master || !this.context) return
    this.master.gain.setTargetAtTime(muted ? 0 : 0.72, this.context.currentTime, 0.08)
  }

  async chime() {
    await this.ensureContext()
    const now = this.context.currentTime
    ;[523.25, 659.25, 783.99].forEach((frequency, index) => {
      const oscillator = this.context.createOscillator()
      const gain = this.context.createGain()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0, now + index * 0.16)
      gain.gain.linearRampToValueAtTime(0.14, now + index * 0.16 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.16 + 1.2)
      oscillator.connect(gain).connect(this.master)
      oscillator.start(now + index * 0.16)
      oscillator.stop(now + index * 0.16 + 1.25)
    })
  }
}

export const audioEngine = new AmbientAudioEngine()
