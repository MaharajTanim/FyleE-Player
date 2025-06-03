import { useState, useEffect } from "react";
import { Library } from "./components/Library";
import { Header } from "./components/Header";
import { VideoPlayer } from "./components/VideoPlayer";
import { FileSelectionPrompt } from "./components/FileSelectionPrompt";
import { FeatureShowcase } from "./components/FeatureShowcase";
import { useVideos } from "./hooks/useVideos";
import { useSettings } from "./hooks/useSettings";
import { VideoContextProvider } from "./context/VideoContext";
import { Settings } from "./components/Settings";
import { PlaylistPanel } from "./components/PlaylistPanel";
import "./styles/app.css";

function App() {
  const { videos, loading, error, handleFileSelection } = useVideos();
  const {
    theme,
    view,
    showSettings,
    showPlaylists,
    toggleSettings,
    togglePlaylists,
  } = useSettings();
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [showFeatureShowcase, setShowFeatureShowcase] = useState(false);

  // Apply theme to html element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <VideoContextProvider>
      <div className="app-container">
        <Header onShowFeatureShowcase={() => setShowFeatureShowcase(true)} />

        <main className="main-content">
          {videos.length > 0 ? (
            <Library view={view} onSelectVideo={setSelectedVideo} />
          ) : (
            <FileSelectionPrompt onSelect={handleFileSelection} error={error} />
          )}
        </main>

        {selectedVideo && (
          <VideoPlayer
            file={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}

        {showSettings && <Settings onClose={toggleSettings} />}
        {showPlaylists && <PlaylistPanel onClose={togglePlaylists} />}
        {showFeatureShowcase && (
          <FeatureShowcase onClose={() => setShowFeatureShowcase(false)} />
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing videos...</p>
          </div>
        )}
      </div>
    </VideoContextProvider>
  );
}

export default App;
