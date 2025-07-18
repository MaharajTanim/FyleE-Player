import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Info,
  Settings,
  Repeat,
  PictureInPicture,
  Keyboard,
  Sliders,
} from "lucide-react";
import { useVideoContext } from "../hooks/useVideoContext";
import { formatDuration } from "../utils/formatters";
import { getFormatRecommendation } from "../utils/codecSupport";
import { BrowserInfo } from "./BrowserInfo";
import "../styles/video-player.css";

interface VideoPlayerProps {
  file: File;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, onClose }) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showBrowserInfo, setShowBrowserInfo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoInfo, setVideoInfo] = useState<{
    format: string;
    resolution: string;
    frameRate: number;
    bitrate: string;
    compatibility?: string;
  } | null>(null);

  // New state variables for enhanced features
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loopMode, setLoopMode] = useState<"none" | "single" | "playlist">(
    "none"
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showVideoFilters, setShowVideoFilters] = useState(false);
  const [videoFilters, setVideoFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
  });
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const { addToRecentlyPlayed } = useVideoContext();

  const applyVideoFilters = useCallback(() => {
    if (!videoRef.current) return;

    const filterStyle = `
      brightness(${videoFilters.brightness}%) 
      contrast(${videoFilters.contrast}%) 
      saturate(${videoFilters.saturation}%) 
      hue-rotate(${videoFilters.hue}deg)
      blur(${videoFilters.blur}px)
      grayscale(${videoFilters.grayscale}%)
    `;

    videoRef.current.style.filter = filterStyle;
  }, [videoFilters]);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Apply video filters when they change
  useEffect(() => {
    applyVideoFilters();
  }, [applyVideoFilters]);

  // Handle Picture-in-Picture events
  useEffect(() => {
    const handlePipEnter = () => setIsPictureInPicture(true);
    const handlePipLeave = () => setIsPictureInPicture(false);

    const video = videoRef.current;
    if (video) {
      video.addEventListener("enterpictureinpicture", handlePipEnter);
      video.addEventListener("leavepictureinpicture", handlePipLeave);
    }

    return () => {
      if (video) {
        video.removeEventListener("enterpictureinpicture", handlePipEnter);
        video.removeEventListener("leavepictureinpicture", handlePipLeave);
      }
    };
  }, []);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    setShowControls(true);

    if (playing) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [playing]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setPlaying(true))
        .catch((error) => {
          const fileExtension = file.name.split(".").pop()?.toLowerCase();
          let errorMessage = "Failed to play video. ";

          if (fileExtension) {
            errorMessage += `${fileExtension.toUpperCase()} format may not be supported by your browser.`;
          } else {
            errorMessage += "The format or codec might not be supported.";
          }

          setVideoError(errorMessage);
          console.error("Video playback error:", error);
        });
    }

    resetControlsTimeout();
  }, [playing, resetControlsTimeout, file.name]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    const newMuted = !muted;
    videoRef.current.muted = newMuted;
    setMuted(newMuted);
    resetControlsTimeout();
  }, [muted, resetControlsTimeout]);

  const skip = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return;

      videoRef.current.currentTime += seconds;
      resetControlsTimeout();
    },
    [resetControlsTimeout]
  );

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;

    if (!fullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [fullscreen]);

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);

      if (videoRef.current) {
        videoRef.current.volume = newVolume;
      }

      setMuted(newVolume === 0);
      resetControlsTimeout();
    },
    [resetControlsTimeout]
  );

  const handleSeek = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const seekTime = parseFloat(e.target.value);

      if (videoRef.current) {
        videoRef.current.currentTime = seekTime;
      }

      setCurrentTime(seekTime);
      resetControlsTimeout();
    },
    [resetControlsTimeout]
  );

  // New enhanced functionality methods
  const togglePictureInPicture = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureEnabled) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPictureInPicture(false);
        } else {
          await videoRef.current.requestPictureInPicture();
          setIsPictureInPicture(true);
        }
      }
    } catch (error) {
      console.error("Picture-in-Picture failed:", error);
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const changePlaybackSpeed = useCallback(
    (speed: number) => {
      if (!videoRef.current) return;

      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      resetControlsTimeout();
    },
    [resetControlsTimeout]
  );

  const toggleLoopMode = useCallback(() => {
    if (!videoRef.current) return;

    const modes: ("none" | "single" | "playlist")[] = [
      "none",
      "single",
      "playlist",
    ];
    const currentIndex = modes.indexOf(loopMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];

    setLoopMode(nextMode);
    videoRef.current.loop = nextMode === "single";
    resetControlsTimeout();
  }, [loopMode, resetControlsTimeout]);

  const resetVideoFilters = useCallback(() => {
    const defaultFilters = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0,
      blur: 0,
      grayscale: 0,
    };
    setVideoFilters(defaultFilters);
  }, []);

  const handleSeekHover = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * duration;
      setHoverTime(time);
      setShowThumbnailPreview(true);
    },
    [duration]
  );

  const handleSeekLeave = useCallback(() => {
    setHoverTime(null);
    setShowThumbnailPreview(false);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  }, []);
  const handleMetadataLoaded = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    setDuration(video.duration);

    // Extract video information
    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || "unknown";
    const fileSizeMB = Math.round(file.size / (1024 * 1024));
    const bitrate =
      fileSizeMB > 0 && video.duration > 0
        ? Math.round((file.size * 8) / (video.duration * 1000))
        : 0; // kbps

    // Get format recommendation for compatibility info
    const formatRec = getFormatRecommendation(file.name);
    const compatibilityLevel = formatRec.likely ? "Good" : "Limited";

    setVideoInfo({
      format: fileExtension.toUpperCase(),
      resolution: `${video.videoWidth}x${video.videoHeight}`,
      frameRate: 0, // Frame rate is not easily accessible from HTML5 video element
      bitrate: bitrate > 0 ? `${bitrate} kbps` : "Unknown",
      compatibility: compatibilityLevel,
    });

    video
      .play()
      .then(() => setPlaying(true))
      .catch((error) => {
        const errorMessage = `Failed to play video. ${fileExtension.toUpperCase()} format may not be supported by your browser.`;
        setVideoError(errorMessage);
        console.error("Video playback error:", error);
      });

    addToRecentlyPlayed({
      file,
      thumbnail: "",
      meta: {
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
        created: file.lastModified,
        size: file.size,
      },
    });
  }, [file, addToRecentlyPlayed]);

  const handleVideoError = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    let errorMessage = "Error playing video.";

    // Get format recommendation
    const formatRec = getFormatRecommendation(file.name);

    // Provide more specific error messages based on error code
    if (video.error) {
      switch (video.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Video playback was aborted.";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error occurred while loading the video.";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = formatRec.likely
            ? "Video codec not supported or file is corrupted."
            : `${formatRec.message} This format may not be fully supported.`;
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = formatRec.message;
          if (formatRec.alternative) {
            errorMessage += ` Consider converting to ${formatRec.alternative} format for better compatibility.`;
          }
          break;
        default:
          errorMessage = "Unknown error occurred while playing video.";
      }
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (fileExtension) {
      errorMessage += ` (${fileExtension.toUpperCase()} format)`;
    }

    setVideoError(errorMessage);
    setPlaying(false);
  }, [file.name]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "l":
          e.preventDefault();
          toggleLoopMode();
          break;
        case "p":
          e.preventDefault();
          togglePictureInPicture();
          break;
        case "s":
          e.preventDefault();
          setShowSettings(!showSettings);
          break;
        case "1":
          e.preventDefault();
          changePlaybackSpeed(0.5);
          break;
        case "2":
          e.preventDefault();
          changePlaybackSpeed(1);
          break;
        case "3":
          e.preventDefault();
          changePlaybackSpeed(1.25);
          break;
        case "4":
          e.preventDefault();
          changePlaybackSpeed(1.5);
          break;
        case "5":
          e.preventDefault();
          changePlaybackSpeed(2);
          break;
        case "?":
          e.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
        case "Escape":
          if (showSettings) {
            setShowSettings(false);
          } else if (showKeyboardShortcuts) {
            setShowKeyboardShortcuts(false);
          } else if (showVideoFilters) {
            setShowVideoFilters(false);
          } else if (!fullscreen) {
            onClose();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    playing,
    fullscreen,
    onClose,
    skip,
    toggleFullscreen,
    toggleMute,
    togglePlay,
    toggleLoopMode,
    togglePictureInPicture,
    changePlaybackSpeed,
    showSettings,
    showKeyboardShortcuts,
    showVideoFilters,
  ]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <div
      className={`video-player-container ${fullscreen ? "fullscreen" : ""}`}
      ref={playerRef}
      onMouseMove={resetControlsTimeout}
    >
      {videoError && (
        <div className="video-error">
          <p>{videoError}</p>
          <div className="error-actions">
            <button
              onClick={() => setShowBrowserInfo(true)}
              className="info-button"
            >
              <Info size={16} />
              Browser Info
            </button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}

      {showBrowserInfo && (
        <BrowserInfo
          fileName={file.name}
          onClose={() => setShowBrowserInfo(false)}
        />
      )}

      <video
        ref={videoRef}
        src={videoUrl}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onError={handleVideoError}
        onEnded={() => setPlaying(false)}
      />

      <div className={`player-controls ${showControls ? "visible" : ""}`}>
        <div className="seek-controls">
          <span className="time-display">{formatDuration(currentTime)}</span>
          <div className="seek-bar-container">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              onMouseMove={handleSeekHover}
              onMouseLeave={handleSeekLeave}
              className="seek-bar"
              aria-label="Video progress"
            />
            {showThumbnailPreview && hoverTime !== null && (
              <div className="seek-preview">
                <div className="seek-preview-time">
                  {formatDuration(hoverTime)}
                </div>
              </div>
            )}
          </div>
          <span className="time-display">{formatDuration(duration)}</span>
        </div>

        <div className="playback-controls">
          <div className="left-controls">
            <button
              onClick={() => skip(-10)}
              className="control-button"
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack size={20} />
            </button>

            <button
              onClick={togglePlay}
              className="control-button play-pause-button"
            >
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </button>

            <button
              onClick={() => skip(10)}
              className="control-button"
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward size={20} />
            </button>
          </div>

          <div className="right-controls">
            <div className="speed-control">
              <select
                value={playbackSpeed}
                onChange={(e) =>
                  changePlaybackSpeed(parseFloat(e.target.value))
                }
                className="speed-select"
                title="Playback speed"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">1x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>

            <button
              onClick={toggleLoopMode}
              className={`control-button ${
                loopMode !== "none" ? "active" : ""
              }`}
              title={`Loop mode: ${loopMode}`}
            >
              <Repeat size={20} />
            </button>

            <button
              onClick={togglePictureInPicture}
              className={`control-button ${isPictureInPicture ? "active" : ""}`}
              title="Picture-in-Picture"
            >
              <PictureInPicture size={20} />
            </button>

            <div className="volume-container">
              <button onClick={toggleMute} className="control-button">
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
                aria-label="Volume control"
              />
            </div>

            <button
              onClick={() => setShowVideoFilters(!showVideoFilters)}
              className={`control-button ${showVideoFilters ? "active" : ""}`}
              title="Video filters"
            >
              <Sliders size={20} />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`control-button ${showSettings ? "active" : ""}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              className="control-button"
              title="Keyboard shortcuts"
            >
              <Keyboard size={20} />
            </button>

            <button onClick={toggleFullscreen} className="control-button">
              {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>

            <button
              onClick={() => setShowBrowserInfo(true)}
              className="control-button"
              title="Browser compatibility info"
            >
              <Info size={18} />
            </button>
          </div>
        </div>
      </div>

      <button
        className={`close-button ${showControls ? "visible" : ""}`}
        onClick={onClose}
        aria-label="Close video player"
      >
        <X size={24} />
      </button>

      <div className="video-title-overlay">
        <h3>{file.name}</h3>
        {videoInfo && (
          <div className="video-details">
            <span>{videoInfo.format}</span>
            <span>{videoInfo.resolution}</span>
            <span>{videoInfo.bitrate}</span>
            {videoInfo.compatibility && (
              <span
                className={`compatibility ${videoInfo.compatibility.toLowerCase()}`}
              >
                {videoInfo.compatibility} Support
              </span>
            )}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="close-panel-button"
              title="Close settings"
              aria-label="Close settings"
            >
              <X size={20} />
            </button>
          </div>
          <div className="settings-content">
            <div className="setting-group">
              <label>Playback Speed</label>
              <select
                value={playbackSpeed}
                onChange={(e) =>
                  changePlaybackSpeed(parseFloat(e.target.value))
                }
                className="setting-select"
                title="Select playback speed"
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="1">Normal (1x)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Loop Mode</label>
              <select
                value={loopMode}
                onChange={(e) =>
                  setLoopMode(e.target.value as "none" | "single" | "playlist")
                }
                className="setting-select"
                title="Select loop mode"
              >
                <option value="none">No Loop</option>
                <option value="single">Loop Single</option>
                <option value="playlist">Loop Playlist</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Video Filters Panel */}
      {showVideoFilters && (
        <div className="video-filters-panel">
          <div className="settings-header">
            <h3>Video Filters</h3>
            <button
              onClick={() => setShowVideoFilters(false)}
              className="close-panel-button"
              title="Close video filters"
              aria-label="Close video filters"
            >
              <X size={20} />
            </button>
          </div>
          <div className="filters-content">
            <div className="filter-group">
              <label>Brightness: {videoFilters.brightness}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={videoFilters.brightness}
                onChange={(e) =>
                  setVideoFilters({
                    ...videoFilters,
                    brightness: parseInt(e.target.value),
                  })
                }
                className="filter-slider"
                aria-label="Brightness"
              />
            </div>
            <div className="filter-group">
              <label>Contrast: {videoFilters.contrast}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={videoFilters.contrast}
                onChange={(e) =>
                  setVideoFilters({
                    ...videoFilters,
                    contrast: parseInt(e.target.value),
                  })
                }
                className="filter-slider"
                aria-label="Contrast"
              />
            </div>
            <div className="filter-group">
              <label>Saturation: {videoFilters.saturation}%</label>
              <input
                type="range"
                min="0"
                max="200"
                value={videoFilters.saturation}
                onChange={(e) =>
                  setVideoFilters({
                    ...videoFilters,
                    saturation: parseInt(e.target.value),
                  })
                }
                className="filter-slider"
                aria-label="Saturation"
              />
            </div>
            <div className="filter-group">
              <label>Hue: {videoFilters.hue}°</label>
              <input
                type="range"
                min="0"
                max="360"
                value={videoFilters.hue}
                onChange={(e) =>
                  setVideoFilters({
                    ...videoFilters,
                    hue: parseInt(e.target.value),
                  })
                }
                className="filter-slider"
                aria-label="Hue"
              />
            </div>
            <div className="filter-group">
              <label>Blur: {videoFilters.blur}px</label>
              <input
                type="range"
                min="0"
                max="10"
                value={videoFilters.blur}
                onChange={(e) =>
                  setVideoFilters({
                    ...videoFilters,
                    blur: parseInt(e.target.value),
                  })
                }
                className="filter-slider"
                aria-label="Blur"
              />
            </div>
            <div className="filter-group">
              <label>Grayscale: {videoFilters.grayscale}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={videoFilters.grayscale}
                onChange={(e) =>
                  setVideoFilters({
                    ...videoFilters,
                    grayscale: parseInt(e.target.value),
                  })
                }
                className="filter-slider"
                aria-label="Grayscale"
              />
            </div>
            <div className="filter-actions">
              <button
                onClick={resetVideoFilters}
                className="filter-reset-button"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Panel */}
      {showKeyboardShortcuts && (
        <div className="keyboard-shortcuts-panel">
          <div className="settings-header">
            <h3>Keyboard Shortcuts</h3>
            <button
              onClick={() => setShowKeyboardShortcuts(false)}
              className="close-panel-button"
              title="Close keyboard shortcuts"
              aria-label="Close keyboard shortcuts"
            >
              <X size={20} />
            </button>
          </div>
          <div className="shortcuts-content">
            <div className="shortcut-group">
              <div className="shortcut-item">
                <kbd>Space</kbd> or <kbd>K</kbd>
                <span>Play/Pause</span>
              </div>
              <div className="shortcut-item">
                <kbd>F</kbd>
                <span>Toggle Fullscreen</span>
              </div>
              <div className="shortcut-item">
                <kbd>M</kbd>
                <span>Toggle Mute</span>
              </div>
              <div className="shortcut-item">
                <kbd>L</kbd>
                <span>Toggle Loop Mode</span>
              </div>
              <div className="shortcut-item">
                <kbd>P</kbd>
                <span>Picture-in-Picture</span>
              </div>
              <div className="shortcut-item">
                <kbd>S</kbd>
                <span>Settings</span>
              </div>
              <div className="shortcut-item">
                <kbd>→</kbd>
                <span>Skip Forward 10s</span>
              </div>
              <div className="shortcut-item">
                <kbd>←</kbd>
                <span>Skip Backward 10s</span>
              </div>
              <div className="shortcut-item">
                <kbd>1-5</kbd>
                <span>Playback Speed (0.5x - 2x)</span>
              </div>
              <div className="shortcut-item">
                <kbd>?</kbd>
                <span>Show/Hide Shortcuts</span>
              </div>
              <div className="shortcut-item">
                <kbd>Esc</kbd>
                <span>Close Player/Panels</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
