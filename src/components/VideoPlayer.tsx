import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Sparkles,
  Check,
  Expand,
  Shrink
} from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  resolution?: string;
  isTheaterMode?: boolean;
  onToggleTheater?: () => void;
  onProgress?: (progressSeconds: number, durationSeconds: number) => void;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  resolution = '4K UHD',
  isTheaterMode = false,
  onToggleTheater,
  onProgress,
  onEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('nyx_player_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<string>(resolution);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number>(0);
  const [bufferedPercent, setBufferedPercent] = useState<number>(0);
  const [showCenterIcon, setShowCenterIcon] = useState<boolean>(false);

  // Sync volume with element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('nyx_player_volume', volume.toString());
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls auto-hide
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 2600);
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 500);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowCenterIcon(true);
      setTimeout(() => setShowCenterIcon(false), 500);
    }
  }, []);

  const seekRelative = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds));
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(v => Math.min(1, v + 0.1));
        setIsMuted(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(v => Math.max(0, v - 0.1));
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted(m => !m);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekRelative]);

  // Video time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);

    // Buffer calculation
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      const total = videoRef.current.duration;
      if (total > 0) {
        setBufferedPercent(Math.min(100, (bufferedEnd / total) * 100));
      }
    }

    if (onProgress && videoRef.current.duration) {
      onProgress(cur, videoRef.current.duration);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative select-none bg-black overflow-hidden group flex items-center justify-center transition-all duration-300 ${
        isTheaterMode
          ? 'w-full max-h-[82vh] aspect-[21/9]'
          : 'w-full aspect-video rounded-xl sm:rounded-2xl border border-zinc-800/80 shadow-2xl'
      }`}
    >
      {/* HTML5 Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()}
        controlsList="nodownload"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setShowControls(true);
          onEnded?.();
        }}
        playsInline
      />

      {/* Big Center Play/Pause Indicator Pulse */}
      {showCenterIcon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 rounded-full bg-black/80 backdrop-blur-md border border-[#FF0033]/60 text-[#FF0033] flex items-center justify-center animate-ping duration-300 drop-shadow-[0_0_20px_rgba(255,0,51,0.6)]">
            {isPlaying ? <Play className="w-8 h-8 fill-current ml-1" /> : <Pause className="w-8 h-8" />}
          </div>
        </div>
      )}

      {/* Top Title Overlay Bar (when controls visible) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity duration-300 pointer-events-none z-20 flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="min-w-0 pr-4">
          <div className="text-xs font-mono uppercase text-[#FF334B] flex items-center gap-1.5 font-bold tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master 8K Stream · ProRes Lossless</span>
          </div>
          <div className="text-sm font-semibold text-white truncate drop-shadow">
            {title}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="px-2.5 py-0.5 rounded bg-black/90 border border-[#FF0033]/40 text-[10px] font-mono text-[#FF334B] font-bold backdrop-blur-md shadow-sm">
            {selectedQuality}
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar (Netflix / YouTube inspired) */}
      <div
        className={`absolute bottom-0 left-0 right-0 pt-10 pb-3 px-4 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Scrubber Container */}
        <div
          onClick={handleScrubberClick}
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          className="relative w-full h-2 group/scrub cursor-pointer mb-3 flex items-center"
        >
          {/* Background track */}
          <div className="absolute inset-0 h-1.5 group-hover/scrub:h-2.5 rounded-full bg-zinc-800/80 transition-all overflow-hidden">
            {/* Buffer bar */}
            <div
              style={{ width: `${bufferedPercent}%` }}
              className="absolute left-0 top-0 bottom-0 bg-zinc-700/60 rounded-full transition-all"
            />
            {/* Played bar with Electric Red-Orange Gradient */}
            <div
              style={{ width: `${progressPercent}%` }}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#FF0033] to-[#FF4500] rounded-full shadow-[0_0_10px_rgba(255,0,51,0.5)]"
            />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              style={{ left: `${hoverPosition}%` }}
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-[#121212] border border-[#333333] text-[10px] font-mono text-zinc-200 pointer-events-none shadow-lg whitespace-nowrap"
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Scrubber Thumb */}
          <div
            style={{ left: `${progressPercent}%` }}
            className="absolute -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-[#FF0033] scale-0 group-hover/scrub:scale-100 transition-transform pointer-events-none drop-shadow-[0_0_8px_rgba(255,0,51,0.8)]"
          />
        </div>

        {/* Buttons Controls Row */}
        <div className="flex items-center justify-between gap-3 text-zinc-300">
          {/* Left Controls: Play, Skips, Volume, Timer */}
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 text-white hover:text-[#FF334B] transition-colors"
              title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Skip -10s */}
            <button
              onClick={() => seekRelative(-10)}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Reculer de 10s (Flèche Gauche)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Skip +10s */}
            <button
              onClick={() => seekRelative(10)}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title="Avancer de 10s (Flèche Droite)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                title={isMuted ? 'Activer le son (M)' : 'Muet (M)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-500" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  setIsMuted(false);
                }}
                className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#FF0033] transition-all opacity-80 group-hover/vol:opacity-100"
              />
            </div>

            {/* Time Display */}
            <div className="text-xs font-mono text-zinc-300 tabular-nums">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="mx-1 text-zinc-500">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls: Quality/Speed Settings, Theater, Fullscreen */}
          <div className="flex items-center gap-3 relative">
            {/* Settings Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 transition-colors ${
                  showSettings ? 'text-[#FF334B]' : 'text-zinc-300 hover:text-white'
                }`}
                title="Paramètres de lecture"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Settings Menu Popup */}
              {showSettings && (
                <div className="absolute right-0 bottom-10 w-52 rounded-xl bg-[#121212]/95 border border-[#222222] backdrop-blur-md p-3 shadow-2xl z-30 space-y-3 text-xs">
                  {/* Quality Selector */}
                  <div>
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">Qualité Flux</div>
                    <div className="space-y-1">
                      {['8K RAW Master', '4K UHD 60fps', '1080p Full HD', '720p HD'].map(q => (
                        <button
                          key={q}
                          onClick={() => {
                            setSelectedQuality(q);
                            setShowSettings(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                            selectedQuality === q
                              ? 'bg-[#FF0033]/20 text-[#FF334B] font-semibold border border-[#FF0033]/30'
                              : 'hover:bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          <span>{q}</span>
                          {selectedQuality === q && <Check className="w-3.5 h-3.5 text-[#FF0033]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Playback Speed Selector */}
                  <div className="pt-2 border-t border-zinc-800">
                    <div className="text-[10px] font-mono uppercase text-zinc-400 mb-1.5">Vitesse de Lecture</div>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={() => {
                            setPlaybackRate(rate);
                            setShowSettings(false);
                          }}
                          className={`px-1.5 py-1 text-center rounded font-mono text-[11px] transition-colors ${
                            playbackRate === rate
                              ? 'bg-gradient-to-r from-[#FF0033] to-[#FF4500] text-white font-bold'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theater Mode Toggle */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                className="p-1.5 text-zinc-300 hover:text-white transition-colors hidden sm:block"
                title={isTheaterMode ? 'Mode standard' : 'Mode cinéma'}
              >
                {isTheaterMode ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors"
              title={isFullscreen ? 'Quitter le plein écran (F)' : 'Plein écran (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
