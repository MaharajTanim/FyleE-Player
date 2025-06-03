import React, { useState } from "react";
import { X, Play, Plus, Trash } from "lucide-react";
import { useVideoContext } from "../hooks/useVideoContext";
import { formatDuration } from "../utils/formatters";
import "../styles/playlist.css";

interface PlaylistPanelProps {
  onClose: () => void;
}

export const PlaylistPanel: React.FC<PlaylistPanelProps> = ({ onClose }) => {
  const { playlist, clearPlaylist, removeFromPlaylist } = useVideoContext();
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const totalDuration = playlist.reduce(
    (total, video) => total + video.meta.duration,
    0
  );

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save this playlist
    setNewPlaylistName("");
  };

  return (
    <div className="playlist-panel">
      <div className="playlist-header">
        <h2>Playlist</h2>
        <div className="playlist-actions">
          <button
            onClick={clearPlaylist}
            className="icon-text-button"
            disabled={playlist.length === 0}
          >
            <Trash size={16} />
            <span>Clear All</span>
          </button>
          <button
            onClick={onClose}
            className="close-button"
            aria-label="Close playlist"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      <div className="playlist-content">
        {playlist.length > 0 ? (
          <>
            <div className="playlist-info">
              <p>
                {playlist.length} videos • {formatDuration(totalDuration)}
              </p>
            </div>

            <ul className="playlist-items">
              {playlist.map((video, index) => (
                <li key={video.file.name + index} className="playlist-item">
                  <div className="playlist-item-thumbnail">
                    {video.thumbnail ? (
                      <img src={video.thumbnail} alt="" />
                    ) : (
                      <Play size={24} />
                    )}
                  </div>
                  <div className="playlist-item-info">
                    <h4>{video.file.name}</h4>
                    <span>{formatDuration(video.meta.duration)}</span>
                  </div>
                  <button
                    onClick={() => removeFromPlaylist(index)}
                    className="remove-button"
                    aria-label="Remove from playlist"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="empty-playlist">
            <Play size={48} />
            <h3>Your playlist is empty</h3>
            <p>Add videos to your playlist from the library</p>
          </div>
        )}
      </div>

      <div className="save-playlist">
        <form onSubmit={handleCreatePlaylist}>
          <input
            type="text"
            placeholder="New playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
          />
          <button
            type="submit"
            className="save-button"
            disabled={newPlaylistName.trim() === "" || playlist.length === 0}
          >
            <Plus size={16} />
            <span>Save Playlist</span>
          </button>
        </form>
      </div>
    </div>
  );
};
