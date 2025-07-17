import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, RotateCcw, Settings, 
  Download, Share2, Bookmark, PictureInPicture,
  Repeat, Shuffle, List, ChevronUp, ChevronDown,
  Monitor, Smartphone, Tablet
} from 'lucide-react';
import { useVideoContext } from '../context/VideoContext';
import { formatDuration } from '../utils/formatters';
import '../styles/video-player.css';

interface VideoPlayerProps {
  file: File;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, onClose }) => {
  // Core video state
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buffered, setBuffered] = useState(0);
  
  // Advanced features
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [loop, setLoop] = useState(false);
  const [autoNext, setAutoNext] = useState(true);
  const [pictureInPicture, setPictureInPicture] = useState(false);
  const [chapters, setChapters] = useState<Array<{time: number, title: string}>>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [quality, setQuality] = useState('auto');
  const [subtitle, setSubtitle] = useState('off');
  const [theatre, setTheatre] = useState(false);
  const [miniPlayer, setMiniPlayer] = useState(false);
  const [playbackHistory, setPlaybackHistory] = useState<number[]>([]);
  const [bookmarks, setBookmarks] = useState<Array<{time: number, title: string}>>([]);
  const [showStats, setShowStats] = useState(false);
  const [videoStats, setVideoStats] = useState({
    droppedFrames: 0,
    totalFrames: 0,
    bandwidth: 0,
    bufferHealth: 0
  });
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const videoUrl = useRef<string>('');
  
  const { addToRecentlyPlayed, playlist, filteredVideos } = useVideoContext();

  // Initialize video URL
  useEffect(() => {
    const url = URL.createObjectURL(file);
    videoUrl.current = url;
    setLoading(true);
    setVideoError(null);
    
    return () => {
      if (videoUrl.current) {
        URL.revokeObjectURL(videoUrl.current);
      }
    };
  }, [file]);

  // Auto-hide controls with improved logic
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (playing && !showSettings && !showPlaylist && !showChapters && !fullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [playing, showSettings, showPlaylist, showChapters, fullscreen]);

  // Enhanced video controls
  const togglePlay = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (playing) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
      resetControlsTimeout();
    } catch (error) {
      setVideoError('Failed to play video. The format or codec might not be supported.');
      console.error('Video playback error:', error);
    }
  }, [playing, resetControlsTimeout]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    
    setMuted(newVolume === 0);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
    
    setCurrentTime(seekTime);
    setPlaybackHistory(prev => [...prev, seekTime].slice(-50)); // Keep last 50 seeks
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !muted;
    videoRef.current.muted = newMuted;
    setMuted(newMuted);
    resetControlsTimeout();
  }, [muted, resetControlsTimeout]);

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setPlaybackHistory(prev => [...prev, newTime].slice(-50));
    resetControlsTimeout();
  }, [duration, resetControlsTimeout]);

  const changePlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const toggleFullscreen = useCallback(async () => {
    if (!playerRef.current) return;
    
    try {
      if (!fullscreen) {
        if (playerRef.current.requestFullscreen) {
          await playerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, [fullscreen]);

  const togglePictureInPicture = useCallback(async () => {
    if (!videoRef.current || !document.pictureInPictureEnabled) return;
    
    try {
      if (pictureInPicture) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-picture error:', error);
    }
  }, [pictureInPicture]);

  const toggleTheatre = useCallback(() => {
    setTheatre(prev => !prev);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const addBookmark = useCallback(() => {
    const bookmark = {
      time: currentTime,
      title: `Bookmark at ${formatDuration(currentTime)}`
    };
    setBookmarks(prev => [...prev, bookmark]);
    resetControlsTimeout();
  }, [currentTime, resetControlsTimeout]);

  const jumpToBookmark = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  const downloadVideo = useCallback(() => {
    const a = document.createElement('a');
    a.href = videoUrl.current;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [file.name]);

  const shareVideo = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          text: `Check out this video: ${file.name}`,
          files: [file]
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(file.name);
      } catch (error) {
        console.error('Clipboard error:', error);
      }
    }
  }, [file]);

  // Enhanced video event handlers
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    
    // Update buffered
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBuffered((bufferedEnd / duration) * 100);
    }
    
    // Update current chapter
    const chapterIndex = chapters.findIndex((chapter, index) => {
      const nextChapter = chapters[index + 1];
      return current >= chapter.time && (!nextChapter || current < nextChapter.time);
    });
    if (chapterIndex !== -1) {
      setCurrentChapter(chapterIndex);
    }

    // Update video stats
    if (videoRef.current.getVideoPlaybackQuality) {
      const quality = videoRef.current.getVideoPlaybackQuality();
      setVideoStats(prev => ({
        ...prev,
        droppedFrames: quality.droppedVideoFrames,
        totalFrames: quality.totalVideoFrames,
        bufferHealth: buffered
      }));
    }
  }, [duration, chapters, buffered]);

  const handleMetadataLoaded = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    setDuration(video.duration);
    setLoading(false);
    
    // Extract video info
    setVideoInfo({
      width: video.videoWidth,
      height: video.videoHeight,
      duration: video.duration,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString()
    });
    
    // Auto-generate chapters for long videos
    if (video.duration > 300) { // 5 minutes
      const chapterCount = Math.min(10, Math.floor(video.duration / 300));
      const generatedChapters = Array.from({ length: chapterCount }, (_, i) => ({
        time: (video.duration / chapterCount) * i,
        title: `Chapter ${i + 1}`
      }));
      setChapters(generatedChapters);
    }
    
    // Add to recently played
    addToRecentlyPlayed({
      file,
      thumbnail: '',
      meta: {
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
        created: file.lastModified,
        size: file.size
      }
    });
    
    // Auto-play with better error handling
    video.play()
      .then(() => setPlaying(true))
      .catch(error => {
        console.warn('Auto-play failed:', error);
        // Don't show error for autoplay failure
      });
  }, [file, addToRecentlyPlayed]);

  const handleVideoError = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    let errorMessage = 'Error playing video.';
    
    if (video.error) {
      switch (video.error.code) {
        case video.error.MEDIA_ERR_ABORTED:
          errorMessage = 'Video playback was aborted.';
          break;
        case video.error.MEDIA_ERR_NETWORK:
          errorMessage = 'Network error occurred while loading video.';
          break;
        case video.error.MEDIA_ERR_DECODE:
          errorMessage = 'Video format or codec not supported.';
          break;
        case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video format not supported by your browser.';
          break;
        default:
          errorMessage = 'Unknown video error occurred.';
      }
    }
    
    setVideoError(errorMessage);
    setPlaying(false);
    setLoading(false);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setPlaying(false);
    
    if (loop) {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else if (autoNext) {
      // Play next video in playlist or library
      const currentIndex = filteredVideos.findIndex(v => v.file.name === file.name);
      if (currentIndex !== -1 && currentIndex < filteredVideos.length - 1) {
        // Would need to implement next video functionality
      }
    }
  }, [loop, autoNext, filteredVideos, file.name]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showSettings || showPlaylist || showChapters) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          toggleTheatre();
          break;
        case 'ArrowRight':
          e.preventDefault();
          skip(e.shiftKey ? 30 : 10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skip(e.shiftKey ? -30 : -10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'l':
          e.preventDefault();
          setLoop(prev => !prev);
          break;
        case 'p':
          e.preventDefault();
          togglePictureInPicture();
          break;
        case 'b':
          e.preventDefault();
          addBookmark();
          break;
        case 'c':
          e.preventDefault();
          setShowChapters(prev => !prev);
          break;
        case 's':
          e.preventDefault();
          setShowStats(prev => !prev);
          break;
        case 'Escape':
          if (!fullscreen) {
            onClose();
          }
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault();
          const percent = parseInt(e.key) / 10;
          if (videoRef.current) {
            videoRef.current.currentTime = duration * percent;
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, skip, toggleMute, togglePictureInPicture, onClose, fullscreen, duration, showSettings, showPlaylist, showChapters, toggleTheatre, addBookmark]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Picture-in-picture handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleEnterPiP = () => setPictureInPicture(true);
    const handleLeavePiP = () => setPictureInPicture(false);
    
    video.addEventListener('enterpictureinpicture', handleEnterPiP);
    video.addEventListener('leavepictureinpicture', handleLeavePiP);
    
    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPiP);
      video.removeEventListener('leavepictureinpicture', handleLeavePiP);
    };
  }, []);

  // Progress bar click handler
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
    setPlaybackHistory(prev => [...prev, seekTime].slice(-50));
    resetControlsTimeout();
  }, [duration, resetControlsTimeout]);

  return (
    <div 
      className={`video-player-container ${fullscreen ? 'fullscreen' : ''} ${theatre ? 'theatre' : ''} ${miniPlayer ? 'mini' : ''}`}
      ref={playerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => !playing && setShowControls(true)}
    >
      {loading && (
        <div className="video-loading">
          <div className="loading-spinner"></div>
          <p>Loading video...</p>
        </div>
      )}

      {videoError && (
        <div className="video-error">
          <div className="error-icon">⚠️</div>
          <h3>Playback Error</h3>
          <p>{videoError}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()}>Retry</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        src={videoUrl.current}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleMetadataLoaded}
        onError={handleVideoError}
        onEnded={handleVideoEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        loop={loop}
        preload="metadata"
        playsInline
      />
      
      <div className={`player-controls ${showControls ? 'visible' : ''}`}>
        {/* Enhanced Progress bar */}
        <div className="progress-container">
          <div 
            className="progress-bar" 
            ref={progressRef}
            onClick={handleProgressClick}
          >
            <div className="progress-buffered" style={{ width: `${buffered}%` }}></div>
            <div className="progress-played" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
            <div className="progress-thumb" style={{ left: `${(currentTime / duration) * 100}%` }}></div>
            
            {/* Chapter markers */}
            {chapters.map((chapter, index) => (
              <div 
                key={index}
                className="chapter-marker"
                style={{ left: `${(chapter.time / duration) * 100}%` }}
                title={chapter.title}
              />
            ))}

            {/* Bookmark markers */}
            {bookmarks.map((bookmark, index) => (
              <div 
                key={index}
                className="bookmark-marker"
                style={{ left: `${(bookmark.time / duration) * 100}%` }}
                title={bookmark.title}
                onClick={(e) => {
                  e.stopPropagation();
                  jumpToBookmark(bookmark.time);
                }}
              />
            ))}
          </div>
          
          <div className="time-display">
            <span>{formatDuration(currentTime)}</span>
            <span>/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
        
        {/* Enhanced main controls */}
        <div className="playback-controls">
          <div className="left-controls">
            <button onClick={() => skip(-10)} className="control-button" title="Rewind 10s (←)">
              <SkipBack size={20} />
            </button>
            
            <button onClick={togglePlay} className="control-button play-pause-button" title={playing ? 'Pause (Space)' : 'Play (Space)'}>
              {playing ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button onClick={() => skip(10)} className="control-button" title="Forward 10s (→)">
              <SkipForward size={20} />
            </button>
            
            <div className="volume-container">
              <button onClick={toggleMute} className="control-button" title={muted ? 'Unmute (M)' : 'Mute (M)'}>
                {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
              <span className="volume-display">{Math.round((muted ? 0 : volume) * 100)}%</span>
            </div>
          </div>
          
          <div className="center-controls">
            <div className="video-title">
              <h3>{file.name}</h3>
              {videoInfo && (
                <span className="video-details">
                  {videoInfo.width}x{videoInfo.height} • {playbackRate}x • {quality}
                </span>
              )}
            </div>
          </div>
          
          <div className="right-controls">
            <button 
              onClick={() => setLoop(!loop)} 
              className={`control-button ${loop ? 'active' : ''}`}
              title="Toggle loop (L)"
            >
              <Repeat size={20} />
            </button>

            <button 
              onClick={addBookmark} 
              className="control-button"
              title="Add bookmark (B)"
            >
              <Bookmark size={20} />
            </button>
            
            <button onClick={downloadVideo} className="control-button" title="Download">
              <Download size={20} />
            </button>
            
            <button onClick={shareVideo} className="control-button" title="Share">
              <Share2 size={20} />
            </button>

            <button 
              onClick={toggleTheatre} 
              className={`control-button ${theatre ? 'active' : ''}`}
              title="Theatre mode (T)"
            >
              <Monitor size={20} />
            </button>
            
            <button 
              onClick={() => setShowChapters(!showChapters)} 
              className={`control-button ${showChapters ? 'active' : ''}`}
              title="Chapters (C)"
            >
              <List size={20} />
            </button>
            
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`control-button ${showSettings ? 'active' : ''}`}
              title="Settings"
            >
              <Settings size={20} />
            </button>
            
            {document.pictureInPictureEnabled && (
              <button onClick={togglePictureInPicture} className="control-button" title="Picture in Picture (P)">
                <PictureInPicture size={20} />
              </button>
            )}
            
            <button onClick={toggleFullscreen} className="control-button" title={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'}>
              {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Settings panel */}
      {showSettings && (
        <div className="player-settings">
          <div className="settings-header">
            <h4>Settings</h4>
            <button onClick={() => setShowSettings(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="settings-section">
            <h5>Playback Speed</h5>
            <div className="speed-options">
              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                <button 
                  key={rate}
                  onClick={() => changePlaybackRate(rate)}
                  className={playbackRate === rate ? 'active' : ''}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
          
          <div className="settings-section">
            <h5>Quality</h5>
            <div className="quality-options">
              <button className={quality === 'auto' ? 'active' : ''} onClick={() => setQuality('auto')}>Auto</button>
              <button className={quality === '1080p' ? 'active' : ''} onClick={() => setQuality('1080p')}>1080p</button>
              <button className={quality === '720p' ? 'active' : ''} onClick={() => setQuality('720p')}>720p</button>
              <button className={quality === '480p' ? 'active' : ''} onClick={() => setQuality('480p')}>480p</button>
            </div>
          </div>

          <div className="settings-section">
            <h5>Options</h5>
            <div className="settings-toggles">
              <label>
                <input 
                  type="checkbox" 
                  checked={autoNext} 
                  onChange={(e) => setAutoNext(e.target.checked)} 
                />
                Auto-play next video
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={showStats} 
                  onChange={(e) => setShowStats(e.target.checked)} 
                />
                Show video stats
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Chapters panel */}
      {showChapters && chapters.length > 0 && (
        <div className="chapters-panel">
          <div className="panel-header">
            <h4>Chapters</h4>
            <button onClick={() => setShowChapters(false)}>
              <X size={16} />
            </button>
          </div>
          <div className="chapters-list">
            {chapters.map((chapter, index) => (
              <button 
                key={index}
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = chapter.time;
                  }
                }}
                className={currentChapter === index ? 'active' : ''}
              >
                <span className="chapter-time">{formatDuration(chapter.time)}</span>
                <span className="chapter-title">{chapter.title}</span>
              </button>
            ))}
          </div>

          {bookmarks.length > 0 && (
            <>
              <div className="bookmarks-header">
                <h5>Bookmarks</h5>
              </div>
              <div className="bookmarks-list">
                {bookmarks.map((bookmark, index) => (
                  <button 
                    key={index}
                    onClick={() => jumpToBookmark(bookmark.time)}
                    className="bookmark-item"
                  >
                    <Bookmark size={14} />
                    <span className="bookmark-time">{formatDuration(bookmark.time)}</span>
                    <span className="bookmark-title">{bookmark.title}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Video stats overlay */}
      {showStats && videoInfo && (
        <div className="video-stats">
          <h4>Video Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Resolution:</span>
              <span className="stat-value">{videoInfo.width}x{videoInfo.height}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Duration:</span>
              <span className="stat-value">{formatDuration(videoInfo.duration)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">File Size:</span>
              <span className="stat-value">{(videoInfo.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Type:</span>
              <span className="stat-value">{videoInfo.type}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Playback Rate:</span>
              <span className="stat-value">{playbackRate}x</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Buffer Health:</span>
              <span className="stat-value">{buffered.toFixed(1)}%</span>
            </div>
            {videoStats.totalFrames > 0 && (
              <div className="stat-item">
                <span className="stat-label">Dropped Frames:</span>
                <span className="stat-value">{videoStats.droppedFrames}/{videoStats.totalFrames}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      <button 
        className={`close-button ${showControls ? 'visible' : ''}`} 
        onClick={onClose}
        title="Close player (Esc)"
      >
        <X size={24} />
      </button>
    </div>
  );
};
