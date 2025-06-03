import React from "react";
import { X } from "lucide-react";
import { useSettings } from "../hooks/useSettings";
import "../styles/settings.css";

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const {
    theme,
    view,
    autoplay,
    thumbnailQuality,
    setThumbnailQuality,
    setAutoplay,
  } = useSettings();

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        <button
          onClick={onClose}
          className="close-button"
          aria-label="Close settings"
        >
          <X size={24} />
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-group">
          <h3>Playback</h3>

          <div className="setting-item">
            <div className="setting-label">
              <span>Autoplay videos</span>
              <p className="setting-description">
                Automatically play videos when opened
              </p>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={autoplay}
                onChange={(e) => setAutoplay(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-group">
          <h3>Appearance</h3>

          <div className="setting-item">
            <div className="setting-label">
              <span>Thumbnail quality</span>
              <p className="setting-description">
                Higher quality uses more memory
              </p>
            </div>
            <select
              value={thumbnailQuality}
              onChange={(e) =>
                setThumbnailQuality(e.target.value as "low" | "medium" | "high")
              }
              className="setting-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="settings-group">
          <h3>About</h3>
          <p className="about-text">
            FyleE Player v2.0
            <br />A modern video player for your local files
          </p>
          <p className="keyboard-shortcuts">
            <strong>Keyboard Shortcuts:</strong>
            <br />
            Space/K: Play/Pause
            <br />
            F: Toggle fullscreen
            <br />
            M: Mute/Unmute
            <br />
            Left/Right arrows: Seek -/+ 10s
            <br />
            Esc: Exit player
          </p>
        </div>
      </div>
    </div>
  );
};
