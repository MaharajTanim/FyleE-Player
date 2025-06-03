import React from "react";
import { Search, Sparkles } from "lucide-react";
import { useVideoContext } from "../hooks/useVideoContext";
import { useSettings } from "../hooks/useSettings";
import {
  FilmIcon,
  ListIcon,
  GridIcon,
  MoonIcon,
  SunIcon,
  FolderIcon,
  SettingsIcon,
  PlaylistIcon,
} from "./Icons";
import "../styles/header.css";

interface HeaderProps {
  onShowFeatureShowcase: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowFeatureShowcase }) => {
  const { handleFileSelection, filter, setFilter, sortVideos } =
    useVideoContext();
  const {
    theme,
    view,
    toggleTheme,
    toggleView,
    toggleSettings,
    togglePlaylists,
  } = useSettings();

  return (
    <header className="app-header">
      <div className="header-left">
        <FilmIcon className="logo-icon" />
        <h1>FileE Player</h1>
      </div>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search videos..."
          value={filter.search}
          onChange={(e) => setFilter({ ...filter, search: e.target.value })}
        />
      </div>

      <div className="header-actions">
        <select
          value={filter.format || "all"}
          onChange={(e) => setFilter({ ...filter, format: e.target.value })}
          className="sort-select filter-select"
          aria-label="Filter by video format"
        >
          <option value="all">All Formats</option>
          <option value="mp4">MP4</option>
          <option value="mov">MOV</option>
          <option value="avi">AVI</option>
          <option value="mkv">MKV</option>
          <option value="webm">WEBM</option>
          <option value="flv">FLV</option>
          <option value="wmv">WMV</option>
          <option value="m4v">M4V</option>
          <option value="mpg">MPG/MPEG</option>
          <option value="3gp">3GP</option>
          <option value="ogv">OGV</option>
          <option value="ts">TS</option>
          <option value="mxf">MXF</option>
        </select>

        <select
          value={filter.sortBy}
          onChange={(e) => {
            setFilter({ ...filter, sortBy: e.target.value });
            sortVideos(e.target.value);
          }}
          className="sort-select"
          aria-label="Sort videos by"
        >
          <option value="name">Sort by Name</option>
          <option value="date">Sort by Date</option>
          <option value="size">Sort by Size</option>
          <option value="duration">Sort by Duration</option>
        </select>

        <button
          className="icon-button"
          onClick={toggleTheme}
          title={
            theme === "light" ? "Switch to dark mode" : "Switch to light mode"
          }
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        <button
          className="icon-button"
          onClick={toggleView}
          title={
            view === "grid" ? "Switch to list view" : "Switch to grid view"
          }
        >
          {view === "grid" ? <ListIcon /> : <GridIcon />}
        </button>

        <button
          className="icon-button"
          onClick={onShowFeatureShowcase}
          title="Features & Browser Support"
        >
          <Sparkles />
        </button>

        <button
          className="icon-button"
          onClick={togglePlaylists}
          title="Playlists"
        >
          <PlaylistIcon />
        </button>

        <button
          className="icon-button"
          onClick={toggleSettings}
          title="Settings"
        >
          <SettingsIcon />
        </button>

        <button className="select-folder-button" onClick={handleFileSelection}>
          <FolderIcon />
          <span>Select Folder</span>
        </button>
      </div>
    </header>
  );
};
