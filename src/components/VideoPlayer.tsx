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

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const { addToRecentlyPlayed } = useVideoContext();

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

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
        case "Escape":
          if (!fullscreen) {
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
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="seek-bar"
            aria-label="Video progress"
          />
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
    </div>
  );
};
