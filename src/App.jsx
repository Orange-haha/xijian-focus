import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AudioLines,
  ChevronDown,
  CircleHelp,
  CloudRain,
  Coffee,
  Flame,
  Leaf,
  Maximize2,
  Minimize2,
  MoonStar,
  Pause,
  Play,
  RefreshCcw,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  TimerReset,
  Trees,
  Volume2,
  VolumeX,
  Waves,
  Wind,
  X,
} from 'lucide-react'
import { audioEngine } from './audioEngine.js'

const sceneAsset = (name) => `${import.meta.env.BASE_URL}assets/scenes/${name}`

const SCENES = [
  {
    id: 'ocean',
    title: '潮汐海岸',
    subtitle: '让浪潮带走杂念',
    tag: '舒缓',
    cover: sceneAsset('ocean.webp'),
    video: 'https://assets.mixkit.co/videos/4078/4078-720.mp4',
    source: 'https://mixkit.co/free-stock-video/ocean-waves-bursting-on-the-shore-of-the-coast-4078/',
    accent: '#b5e4d8',
    sound: 'ocean',
  },
  {
    id: 'rainforest',
    title: '雨落森屿',
    subtitle: '在细雨里保持清醒',
    tag: '沉静',
    cover: sceneAsset('rainforest.webp'),
    video: 'https://assets.mixkit.co/videos/22728/22728-720.mp4',
    source: 'https://mixkit.co/free-stock-video/raining-in-a-cloud-forest-full-of-tall-trees-22728/',
    accent: '#a7d7bd',
    sound: 'rain',
  },
  {
    id: 'snow',
    title: '雪境木屋',
    subtitle: '世界安静得只剩呼吸',
    tag: '纯净',
    cover: sceneAsset('snow.webp'),
    video: 'https://assets.mixkit.co/videos/3310/3310-720.mp4',
    source: 'https://mixkit.co/free-stock-video/open-environment-of-a-cold-and-snowy-forest-3310/',
    accent: '#c8e1ed',
    sound: 'wind',
  },
  {
    id: 'campfire',
    title: '林间篝火',
    subtitle: '温暖陪伴漫长专注',
    tag: '温暖',
    cover: sceneAsset('campfire.webp'),
    video: 'https://assets.mixkit.co/videos/22730/22730-720.mp4',
    source: 'https://mixkit.co/free-stock-video/campfire-burning-wood-logs-in-the-dark-22730/',
    accent: '#f6c38c',
    sound: 'fire',
  },
  {
    id: 'sunset',
    title: '暮色群山',
    subtitle: '把今天留给一件重要的事',
    tag: '辽阔',
    cover: sceneAsset('sunset.webp'),
    video: 'https://assets.mixkit.co/videos/3128/3128-720.mp4',
    source: 'https://mixkit.co/free-stock-video/landscape-of-mountains-and-sunset-3128/',
    accent: '#efc1b7',
    sound: 'wind',
  },
  {
    id: 'starlake',
    title: '星河静湖',
    subtitle: '与夜色一起进入心流',
    tag: '深度',
    cover: sceneAsset('starlake.webp'),
    video: 'https://assets.mixkit.co/videos/1704/1704-720.mp4',
    source: 'https://mixkit.co/free-stock-video/night-sky-with-stars-at-a-calm-lake-time-lapse-1704/',
    accent: '#c3c9ef',
    sound: 'forest',
  },
]

const SOUND_DEFS = [
  { id: 'rain', name: '细雨', Icon: CloudRain, defaultVolume: 0.38 },
  { id: 'ocean', name: '海浪', Icon: Waves, defaultVolume: 0.42 },
  { id: 'fire', name: '篝火', Icon: Flame, defaultVolume: 0.32 },
  { id: 'forest', name: '森林', Icon: Trees, defaultVolume: 0.25 },
  { id: 'wind', name: '微风', Icon: Wind, defaultVolume: 0.28 },
  { id: 'cafe', name: '咖啡馆', Icon: Coffee, defaultVolume: 0.22 },
]

const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // The app remains usable when storage is unavailable.
    }
  },
}

const formatTime = (seconds) => {
  const safe = Math.max(0, seconds)
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

function useFocusTimer(onComplete) {
  const initial = useMemo(() => {
    const saved = storage.get('xijian-timer', null)
    if (!saved) return { duration: 3000, remaining: 3000, status: 'idle', endAt: null }
    if (saved.status === 'running' && saved.endAt) {
      const remaining = Math.max(0, Math.ceil((saved.endAt - Date.now()) / 1000))
      return { ...saved, remaining, status: remaining ? 'running' : 'complete' }
    }
    return saved
  }, [])
  const [timer, setTimer] = useState(initial)
  const completedRef = useRef(timer.status === 'complete')

  const syncClock = useCallback(() => {
    setTimer((current) => {
      if (current.status !== 'running' || !current.endAt) return current
      const remaining = Math.max(0, Math.ceil((current.endAt - Date.now()) / 1000))
      if (remaining === current.remaining) return current
      return { ...current, remaining, status: remaining === 0 ? 'complete' : 'running' }
    })
  }, [])

  useEffect(() => {
    if (timer.status !== 'running') return undefined
    const interval = window.setInterval(syncClock, 250)
    const onVisibility = () => syncClock()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [syncClock, timer.status])

  useEffect(() => {
    storage.set('xijian-timer', timer)
    document.title = timer.status === 'running'
      ? `${formatTime(timer.remaining)} · 息间专注`
      : '息间 · 沉浸专注'
    if (timer.status === 'complete' && !completedRef.current) {
      completedRef.current = true
      onComplete()
    }
    if (timer.status !== 'complete') completedRef.current = false
  }, [onComplete, timer])

  const start = () => setTimer((current) => {
    const remaining = current.remaining > 0 ? current.remaining : current.duration
    return { ...current, remaining, status: 'running', endAt: Date.now() + remaining * 1000 }
  })
  const pause = () => setTimer((current) => {
    if (current.status !== 'running') return current
    const remaining = Math.max(0, Math.ceil((current.endAt - Date.now()) / 1000))
    return { ...current, remaining, status: 'paused', endAt: null }
  })
  const reset = () => setTimer((current) => ({ ...current, remaining: current.duration, status: 'idle', endAt: null }))
  const setPreset = (minutes) => setTimer({ duration: minutes * 60, remaining: minutes * 60, status: 'idle', endAt: null })
  const adjustDuration = (minutes) => setTimer((current) => {
    const duration = Math.min(240, Math.max(1, minutes)) * 60
    const difference = duration - current.duration
    if (difference === 0) return current
    if (current.status === 'idle' || current.status === 'complete') {
      return { duration, remaining: duration, status: 'idle', endAt: null }
    }
    const now = Date.now()
    const remaining = current.status === 'running'
      ? Math.max(0, Math.ceil((current.endAt - now) / 1000))
      : current.remaining
    const nextRemaining = Math.min(duration, Math.max(0, remaining + difference))
    if (nextRemaining === 0) return { duration, remaining: 0, status: 'complete', endAt: null }
    return {
      duration,
      remaining: nextRemaining,
      status: current.status,
      endAt: current.status === 'running' ? now + nextRemaining * 1000 : null,
    }
  })

  return { timer, start, pause, reset, setPreset, adjustDuration }
}

function SoundPanel({ tracks, setTracks, collapsed, setCollapsed, muted, setMuted, onError }) {
  const activeCount = Object.values(tracks).filter((track) => track.enabled).length

  const updateTrack = async (id, patch) => {
    const next = { ...tracks[id], ...patch }
    setTracks((current) => ({ ...current, [id]: next }))
    try {
      await audioEngine.setChannel(id, next.enabled, next.volume)
    } catch (error) {
      onError(error.message)
    }
  }

  return (
    <aside className={`sound-panel glass ${collapsed ? 'is-collapsed' : ''}`} aria-label="环境音控制">
      <button className="panel-heading" onClick={() => setCollapsed(!collapsed)} aria-expanded={!collapsed}>
        <span className="heading-icon"><AudioLines size={18} /></span>
        <span>
          <strong>环境音</strong>
          <small>{activeCount ? `${activeCount} 个声音正在播放` : '为此刻添一点氛围'}</small>
        </span>
        <ChevronDown className="chevron" size={18} />
      </button>
      {!collapsed && (
        <div className="sound-content">
          <div className="sound-grid">
            {SOUND_DEFS.map(({ id, name, Icon }) => {
              const track = tracks[id]
              return (
                <div className={`sound-item ${track.enabled ? 'is-active' : ''}`} key={id}>
                  <button
                    className="sound-toggle"
                    onClick={() => updateTrack(id, { enabled: !track.enabled })}
                    aria-pressed={track.enabled}
                    aria-label={`${track.enabled ? '关闭' : '开启'}${name}`}
                  >
                    <Icon size={19} />
                    <span>{name}</span>
                    <i />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={track.volume}
                    onChange={(event) => updateTrack(id, { volume: Number(event.target.value) })}
                    aria-label={`${name}音量`}
                    style={{ '--range': `${track.volume * 100}%` }}
                  />
                </div>
              )
            })}
          </div>
          <button
            className="master-toggle"
            onClick={() => {
              const next = !muted
              setMuted(next)
              audioEngine.setMaster(next)
            }}
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            {muted ? '恢复全部声音' : '暂时静音'}
          </button>
        </div>
      )}
    </aside>
  )
}

function TimerCard({ timer, start, pause, reset, setPreset, adjustDuration, compact = false }) {
  const [showCustom, setShowCustom] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [customError, setCustomError] = useState('')
  const progress = timer.duration ? timer.remaining / timer.duration : 0
  const circumference = 2 * Math.PI * 76
  const validDraft = /^\d+$/.test(customMinutes) && Number(customMinutes) >= 1 && Number(customMinutes) <= 240
  const stepBase = validDraft ? Number(customMinutes) : Math.round(timer.duration / 60)
  const stepDuration = (change) => {
    const minutes = Math.min(240, Math.max(1, stepBase + change))
    adjustDuration(minutes)
    setCustomMinutes(String(minutes))
    setCustomError('')
  }
  const chooseDuration = (minutes) => {
    if ((timer.status === 'running' || timer.status === 'paused') &&
      !window.confirm('修改专注时长会重置当前计时，确定继续吗？')) return false
    setPreset(minutes)
    setCustomMinutes(String(minutes))
    setShowCustom(false)
    return true
  }
  const submitCustom = (event) => {
    event.preventDefault()
    const value = customMinutes.trim()
    if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 240) {
      setCustomError('请输入 1–240 之间的整数分钟')
      return
    }
    if (chooseDuration(Number(value))) {
      setShowCustom(false)
      setCustomError('')
    }
  }
  return (
    <section className={`timer-card glass ${compact ? 'compact' : ''} ${timer.status === 'running' ? 'is-running' : ''}`} aria-label="专注计时器">
      <div className="timer-label"><Sparkles size={14} /> {timer.status === 'running' ? '正在专注' : timer.status === 'paused' ? '稍作停顿' : timer.status === 'complete' ? '本轮完成' : '准备专注'}</div>
      <div className="timer-ring">
        <svg viewBox="0 0 180 180" aria-hidden="true">
          <circle className="ring-track" cx="90" cy="90" r="76" />
          <circle
            className="ring-progress"
            cx="90"
            cy="90"
            r="76"
            style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - progress) }}
          />
        </svg>
        <div className="timer-time">
          <strong>{formatTime(timer.remaining)}</strong>
          <span>{Math.round(timer.duration / 60)} 分钟专注</span>
        </div>
      </div>
      <div className="presets" aria-label="快捷时长">
        {[25, 50, 90].map((minutes) => (
          <button key={minutes} type="button" onClick={() => chooseDuration(minutes)} className={timer.duration === minutes * 60 ? 'active' : ''} aria-pressed={timer.duration === minutes * 60}>{minutes}</button>
        ))}
        <button type="button" className={![25, 50, 90].includes(timer.duration / 60) ? 'active' : ''} aria-expanded={showCustom} aria-controls="custom-duration" onClick={() => {
          setCustomMinutes(String(Math.round(timer.duration / 60)))
          setCustomError('')
          setShowCustom((current) => !current)
        }}>自定义</button>
      </div>
      {showCustom && (
        <form id="custom-duration" className="custom-duration" onSubmit={submitCustom} noValidate>
          <div className="custom-duration-heading">
            <label htmlFor="custom-minutes">自定义时长</label>
            <span>1–240 分钟</span>
          </div>
          <div className="duration-stepper">
            <button type="button" onClick={() => stepDuration(-5)} disabled={stepBase <= 1} aria-label="减少 5 分钟">−5</button>
            <div className="duration-input-wrap">
              <input id="custom-minutes" type="text" inputMode="numeric" pattern="[0-9]*" value={customMinutes} onChange={(event) => {
                setCustomMinutes(event.target.value)
                setCustomError('')
              }} aria-invalid={Boolean(customError)} aria-describedby={customError ? 'custom-duration-error' : 'custom-duration-hint'} />
              <span>分钟</span>
            </div>
            <button type="button" onClick={() => stepDuration(5)} disabled={stepBase >= 240} aria-label="增加 5 分钟">+5</button>
          </div>
          <button className="apply-duration" type="submit">应用时长</button>
          <small id={customError ? 'custom-duration-error' : 'custom-duration-hint'} className={customError ? 'custom-duration-error' : ''}>{customError || '±5 分钟立即生效，输入时长后点应用'}</small>
        </form>
      )}
      <div className="timer-actions">
        <button className="icon-button" onClick={reset} aria-label="重置计时"><RefreshCcw size={18} /></button>
        <button className="primary-timer-button" onClick={timer.status === 'running' ? pause : start}>
          {timer.status === 'running' ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          {timer.status === 'running' ? '暂停' : timer.status === 'paused' ? '继续' : timer.status === 'complete' ? '再来一轮' : '开始专注'}
        </button>
        <span className="action-spacer" />
      </div>
    </section>
  )
}

export default function App() {
  const savedSettings = useMemo(() => storage.get('xijian-settings', {}), [])
  const [sceneId, setSceneId] = useState(savedSettings.sceneId || 'ocean')
  const [videoFailed, setVideoFailed] = useState(false)
  const [focusMode, setFocusMode] = useState(savedSettings.focusMode || false)
  const [soundCollapsed, setSoundCollapsed] = useState(savedSettings.soundCollapsed || false)
  const [muted, setMuted] = useState(savedSettings.muted || false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tracks, setTracks] = useState(() => {
    const saved = storage.get('xijian-sounds', {})
    return Object.fromEntries(SOUND_DEFS.map((item) => [item.id, saved[item.id] || { enabled: false, volume: item.defaultVolume }]))
  })
  const scene = SCENES.find((item) => item.id === sceneId) || SCENES[0]

  const showToast = useCallback((message) => {
    setToast(message)
    window.clearTimeout(showToast.timeout)
    showToast.timeout = window.setTimeout(() => setToast(''), 3200)
  }, [])

  const onTimerComplete = useCallback(() => {
    showToast('本轮专注完成。起身舒展一下吧。')
    audioEngine.chime().catch(() => {})
  }, [showToast])
  const timerControls = useFocusTimer(onTimerComplete)

  useEffect(() => {
    storage.set('xijian-settings', { sceneId, focusMode, soundCollapsed, muted })
  }, [focusMode, muted, sceneId, soundCollapsed])

  useEffect(() => storage.set('xijian-sounds', tracks), [tracks])

  useEffect(() => {
    const onFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreen)
    return () => document.removeEventListener('fullscreenchange', onFullscreen)
  }, [])

  const selectScene = async (nextScene) => {
    setSceneId(nextScene.id)
    setVideoFailed(false)
    const current = tracks[nextScene.sound]
    if (!current.enabled) {
      const next = { ...current, enabled: true }
      setTracks((all) => ({ ...all, [nextScene.sound]: next }))
      try {
        await audioEngine.setChannel(nextScene.sound, true, next.volume)
        if (muted) audioEngine.setMaster(true)
      } catch (error) {
        showToast(error.message)
      }
    }
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await document.documentElement.requestFullscreen()
    } catch {
      showToast('浏览器未允许进入全屏')
    }
  }

  return (
    <div className={`app-shell ${focusMode ? 'focus-mode' : ''}`} style={{ '--accent': scene.accent }}>
      <div className="background" style={{ backgroundImage: `url(${scene.cover})` }}>
        {!videoFailed && (
          <video
            key={scene.video}
            autoPlay
            muted
            loop
            playsInline
            poster={scene.cover}
            onError={() => setVideoFailed(true)}
          >
            <source src={scene.video} type="video/mp4" />
          </video>
        )}
        <div className="background-scrim" />
        <div className="ambient-orb one" />
        <div className="ambient-orb two" />
      </div>

      <header className="topbar">
        <button className="brand" onClick={() => setFocusMode(false)} aria-label="返回场景首页">
          <span className="brand-mark"><Leaf size={20} /></span>
          <span><strong>息间</strong><small>XI JIAN</small></span>
        </button>
        <nav aria-label="主导航">
          <button className={!focusMode ? 'active' : ''} onClick={() => setFocusMode(false)}>场景</button>
          <button className={focusMode ? 'active' : ''} onClick={() => setFocusMode(true)}>专注</button>
          <button onClick={() => setAboutOpen(true)}>关于</button>
        </nav>
        <div className="top-actions">
          <button className="round-button" onClick={toggleFullscreen} aria-label={isFullscreen ? '退出全屏' : '进入全屏'}>
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button className="focus-entry" onClick={() => setFocusMode(!focusMode)}>
            <TimerReset size={17} /> {focusMode ? '浏览场景' : '开始专注'}
          </button>
        </div>
      </header>

      {!focusMode ? (
        <main className="home-view">
          <section className="hero">
            <div className="eyebrow"><MoonStar size={14} /> 给忙碌的世界按下静音</div>
            <h1>在自然里，<br /><em>找回你的节奏。</em></h1>
            <p>选择一处风景，混合喜欢的声音。<br />接下来的时间，只留给当下。</p>
            <button className="hero-cta" onClick={() => setFocusMode(true)}><Play size={18} fill="currentColor" /> 开始 {Math.round(timerControls.timer.duration / 60)} 分钟专注</button>
          </section>

          <section className="scene-section" aria-labelledby="scene-title">
            <div className="section-heading">
              <div>
                <span>SELECT A PLACE</span>
                <h2 id="scene-title">此刻，想去哪里？</h2>
              </div>
              <p><SlidersHorizontal size={15} /> 选择场景会自动加入推荐环境音</p>
            </div>
            <div className="scene-grid">
              {SCENES.map((item, index) => (
                <button
                  key={item.id}
                  className={`scene-card ${item.id === sceneId ? 'is-selected' : ''}`}
                  onClick={() => selectScene(item)}
                  style={{ '--delay': `${index * 55}ms` }}
                >
                  <img src={item.cover} alt="" />
                  <span className="card-shade" />
                  <span className="scene-index">0{index + 1}</span>
                  <span className="scene-tag">{item.tag}</span>
                  <span className="scene-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
                  <span className="scene-play"><Play size={14} fill="currentColor" /></span>
                </button>
              ))}
            </div>
          </section>

          <SoundPanel
            tracks={tracks}
            setTracks={setTracks}
            collapsed={soundCollapsed}
            setCollapsed={setSoundCollapsed}
            muted={muted}
            setMuted={setMuted}
            onError={showToast}
          />

          <button className="mini-timer glass" onClick={() => setFocusMode(true)}>
            <span><TimerReset size={16} /></span>
            <strong>{formatTime(timerControls.timer.remaining)}</strong>
            <small>{timerControls.timer.status === 'running' ? '专注进行中' : '打开专注计时'}</small>
            {timerControls.timer.status === 'running' ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          </button>
        </main>
      ) : (
        <main className="focus-view">
          <div className="focus-scene-label">
            <span>{scene.tag}场景</span>
            <h2>{scene.title}</h2>
            <p>{scene.subtitle}</p>
          </div>
          <TimerCard {...timerControls} />
          <div className="focus-bottom">
            <div className="scene-pills glass">
              {SCENES.map((item) => (
                <button key={item.id} className={item.id === sceneId ? 'active' : ''} onClick={() => selectScene(item)}>
                  <img src={item.cover} alt="" /><span>{item.title}</span>
                </button>
              ))}
            </div>
            <SoundPanel
              tracks={tracks}
              setTracks={setTracks}
              collapsed={soundCollapsed}
              setCollapsed={setSoundCollapsed}
              muted={muted}
              setMuted={setMuted}
              onError={showToast}
            />
          </div>
        </main>
      )}

      {videoFailed && <div className="video-note"><CircleHelp size={14} /> 动态背景暂不可用，已显示高清静态场景</div>}
      {toast && <div className="toast" role="status">{toast}</div>}

      {aboutOpen && (
        <div className="modal-backdrop" onClick={() => setAboutOpen(false)}>
          <section className="about-modal glass" onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="about-title">
            <button className="modal-close" onClick={() => setAboutOpen(false)} aria-label="关闭"><X size={18} /></button>
            <div className="about-mark"><Leaf size={26} /></div>
            <span className="eyebrow">ABOUT XI JIAN</span>
            <h2 id="about-title">给注意力一处栖身之所</h2>
            <p>息间是一款纯前端的沉浸式专注工具。没有账号、没有追踪，计时与偏好只保存在你的浏览器中。</p>
            <div className="about-features">
              <span><Waves size={17} /> 6 处动态自然场景</span>
              <span><AudioLines size={17} /> 可自由混合的合成环境音</span>
              <span><TimerReset size={17} /> 刷新也不会丢失的专注计时</span>
            </div>
            <p className="source-note">动态视频来自 <a href={scene.source} target="_blank" rel="noreferrer">Mixkit 免费素材库</a>，使用遵循 Mixkit Free License。场景封面由 OpenAI 图像生成工具为本项目制作。</p>
          </section>
        </div>
      )}
    </div>
  )
}
