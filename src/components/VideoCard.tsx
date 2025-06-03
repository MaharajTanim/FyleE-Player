import React, { useState, useRef } from "react";
import {
  Play,
  Clock,
  Calendar,
  HardDrive,
  MoreVertical,
  Plus,
} from "lucide-react";
import {
  formatDuration,
  formatDate,
  formatFileSize,
} from "../utils/formatters";
import { useVideoContext } from "../hooks/useVideoContext";
import "../styles/video-card.css";

interface VideoCardProps {
  video: VideoMetadata;
  onSelect: (file: File) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  const [showControls, setShowControls] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToPlaylist, recentlyPlayed } = useVideoContext();

  const isRecent = recentlyPlayed.some((v) => v.file.name === video.file.name);

  const handleMouseEnter = () => {
    setShowControls(true);
    if (previewRef.current) {
      previewRef.current.play().catch(() => {
        // Silent failure for autoplay
      });
    }
  };

  const handleMouseLeave = () => {
    setShowControls(false);
    setShowMenu(false);
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handlePlay = () => {
    onSelect(video.file);
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToPlaylist(video);
    setShowMenu(false);
  };

  return (
    <div
      className={`video-card ${isRecent ? "recent" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handlePlay}
    >
      <div className="video-thumbnail">
        {video.thumbnail ? (
          <>
            <img
              src={video.thumbnail}
              alt={`Thumbnail for ${video.file.name}`}
              className="thumbnail-img"
            />
            <video
              ref={previewRef}
              src={URL.createObjectURL(video.file)}
              muted
              loop
              className={`preview-video ${showControls ? "visible" : ""}`}
            />
          </>
        ) : (
          <div className="thumbnail-placeholder">
            <Play size={48} />
          </div>
        )}

        {isRecent && (
          <div className="recently-played-badge">Recently Played</div>
        )}

        {showControls && (
          <div className="thumbnail-overlay">
            <button className="play-button" aria-label="Play video">
              <Play size={32} />
            </button>
          </div>
        )}
      </div>

      <div className="card-content">
        <div className="video-info">
          <h3 title={video.file.name}>{video.file.name}</h3>

          <div className="video-meta">
            <span className="meta-item">
              <Clock size={14} />
              {formatDuration(video.meta.duration)}
            </span>
            <span className="meta-item">
              <Calendar size={14} />
              {formatDate(video.meta.created)}
            </span>
            <span className="meta-item">
              <HardDrive size={14} />
              {formatFileSize(video.meta.size)}
            </span>
          </div>
        </div>

        <button
          className="menu-button"
          onClick={handleMenuToggle}
          aria-label="More options"
        >
          <MoreVertical size={20} />
        </button>

        {showMenu && (
          <div className="video-menu" ref={menuRef}>
            <ul>
              <li onClick={handleAddToPlaylist}>
                <Plus size={16} />
                Add to playlist
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
