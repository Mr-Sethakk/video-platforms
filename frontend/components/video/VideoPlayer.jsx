'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Lock } from 'lucide-react';
import Link from 'next/link';

const VIP_COLORS = {
  USER:  { bg: 'bg-[#6B7280]/20', text: 'text-[#9CA3AF]', border: 'border-[#6B7280]/30', label: '免费观看' },
  VIP:   { bg: 'bg-[#F59E0B]/20', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30', label: 'VIP专属' },
  VVIP:  { bg: 'bg-[#6366F1]/20', text: 'text-[#6366F1]', border: 'border-[#6366F1]/30', label: 'VVIP专属' },
  SVIP:  { bg: 'bg-[#EF4444]/20', text: 'text-[#EF4444]', border: 'border-[#EF4444]/30', label: 'SVIP专属' },
};

const VIP_ORDER = ['USER', 'VIP', 'VVIP', 'SVIP'];

/**
 * 判断用户VIP等级是否满足要求
 */
function hasVipAccess(userLevel, requiredLevel) {
  if (!requiredLevel || requiredLevel === 'USER') return true;
  return VIP_ORDER.indexOf(userLevel) >= VIP_ORDER.indexOf(requiredLevel);
}

/**
 * 格式化时间 mm:ss
 */
function formatTime(seconds) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * 视频播放器组件
 * - HTML5 <video> + 自定义控制栏（YouTube 风格）
 * - 播放进度 localStorage 记忆
 * - VIP 等级锁屏遮罩
 */
export default function VideoPlayer({
  src,
  poster,
  movieId,
  movieTitle = '',
  requiredVipLevel = 'USER',
  userVipLevel = 'USER',
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const hideTimerRef = useRef(null);
  const saveTimerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const [seekingTime, setSeekingTime] = useState(0);

  const hasAccess = hasVipAccess(userVipLevel, requiredVipLevel);
  const vipStyle = VIP_COLORS[requiredVipLevel] || VIP_COLORS.USER;

  // 进度 localStorage key
  const progressKey = `video_progress_${movieId}`;

  // ========== Video event handlers ==========
  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);

    // 恢复上次播放进度
    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        const t = parseFloat(saved);
        if (t > 0 && t < video.duration - 5) {
          video.currentTime = t;
        }
      }
    } catch { /* ignore */ }
  }, [progressKey]);

  const onTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || seeking) return;
    setCurrentTime(video.currentTime);

    // 更新缓冲进度
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }

    // 每 10 秒保存进度
    if (!saveTimerRef.current) {
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        try {
          localStorage.setItem(progressKey, String(video.currentTime));
        } catch { /* ignore */ }
      }, 10000);
    }
  }, [seeking, progressKey]);

  const onEnded = useCallback(() => {
    setPlaying(false);
    try {
      localStorage.setItem(progressKey, '0');
    } catch { /* ignore */ }
  }, [progressKey]);

  // ========== Controls ==========
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !hasAccess) return;
    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [hasAccess]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const video = videoRef.current;
    if (!video) return;
    const v = parseFloat(e.target.value);
    video.volume = v;
    setVolume(v);
    setMuted(v === 0);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Keyboard: Space to toggle play
  useEffect(() => {
    const handler = (e) => {
      if (e.key === ' ' && document.activeElement === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay]);

  // ========== Progress bar ==========
  const handleProgressSeek = useCallback((e) => {
    const bar = progressRef.current;
    const video = videoRef.current;
    if (!bar || !video) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t = ratio * (duration || 0);
    setSeekingTime(t);
    setSeeking(true);
  }, [duration]);

  const handleProgressCommit = useCallback(() => {
    const video = videoRef.current;
    if (!video || !seeking) return;
    video.currentTime = seekingTime;
    setCurrentTime(seekingTime);
    setSeeking(false);
    if (!playing) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [seeking, seekingTime, playing]);

  // ========== Controls auto-hide ==========
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (playing) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    if (playing) {
      hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
    } else {
      setControlsVisible(true);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [playing]);

  // ========== Calculate progress display ==========
  const displayTime = seeking ? seekingTime : currentTime;
  const displayRatio = duration > 0 ? displayTime / duration : 0;
  const bufferedRatio = duration > 0 ? buffered / duration : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseMove={showControls}
      onMouseLeave={() => playing && setControlsVisible(false)}
    >
      {/* ===== Video element ===== */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain bg-black"
        playsInline
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onClick={togglePlay}
      />

      {/* ===== VIP Lock overlay ===== */}
      {!hasAccess && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
          <Lock size={48} strokeWidth={1.5} className="text-[#F59E0B] mb-4" />
          <p className="text-white text-lg font-medium mb-2">
            {requiredVipLevel} 专属内容
          </p>
          <p className="text-[#AAAAAA] text-sm mb-6">
            升级您的VIP等级以观看此视频
          </p>
          <Link
            href="/membership"
            className="rounded-full bg-[#F59E0B] text-black px-8 py-2.5 text-sm font-bold hover:bg-[#D97706] transition-colors"
          >
            立即升级
          </Link>
        </div>
      )}

      {/* ===== Click-to-play overlay (paused) ===== */}
      {!playing && hasAccess && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-black/60 flex items-center justify-center hover:bg-[#FF0000]/80 transition-all duration-200 hover:scale-110">
            <Play size={32} strokeWidth={1.5} fill="white" className="text-white ml-1" />
          </div>
        </div>
      )}

      {/* ===== Custom controls bar ===== */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Gradient fade */}
        <div className="absolute bottom-full left-0 right-0 h-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Controls row */}
        <div className="relative px-4 pb-3 pt-6">
          {/* Progress bar */}
          <div
            ref={progressRef}
            className="relative w-full h-1 bg-[#3F3F3F] rounded-full cursor-pointer group/progress mb-2 hover:h-1.5 transition-[height]"
            onMouseDown={handleProgressSeek}
            onMouseMove={(e) => seeking && handleProgressSeek(e)}
            onMouseUp={handleProgressCommit}
            onMouseLeave={() => seeking && setSeeking(false)}
            onClick={handleProgressCommit}
          >
            {/* Buffered amount */}
            <div
              className="absolute top-0 left-0 h-full bg-[#717171] rounded-full"
              style={{ width: `${bufferedRatio * 100}%` }}
            />
            {/* Played amount */}
            <div
              className="absolute top-0 left-0 h-full bg-[#FF0000] rounded-full"
              style={{ width: `${displayRatio * 100}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#FF0000] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
              style={{ left: `calc(${displayRatio * 100}% - 6px)` }}
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-[#FF0000] transition-colors"
            >
              {playing ? (
                <Pause size={20} strokeWidth={1.5} fill="white" />
              ) : (
                <Play size={20} strokeWidth={1.5} fill="white" />
              )}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="text-white hover:text-[#FF0000] transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX size={18} strokeWidth={1.5} />
                ) : (
                  <Volume2 size={18} strokeWidth={1.5} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/vol:w-20 transition-all duration-200 accent-[#FF0000] h-1 cursor-pointer"
              />
            </div>

            {/* Time */}
            <span className="text-xs text-[#AAAAAA] select-none ml-1">
              {formatTime(displayTime)} / {formatTime(duration)}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* VIP badge */}
            {requiredVipLevel && requiredVipLevel !== 'USER' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${vipStyle.bg} ${vipStyle.text} ${vipStyle.border}`}>
                {vipStyle.label}
              </span>
            )}

            {/* Movie title */}
            <span className="text-xs text-[#AAAAAA] select-none max-w-[200px] truncate hidden sm:block">
              {movieTitle}
            </span>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-[#FF0000] transition-colors"
            >
              {isFullscreen ? (
                <Minimize size={18} strokeWidth={1.5} />
              ) : (
                <Maximize size={18} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
