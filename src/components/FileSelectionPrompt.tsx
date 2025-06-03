import React from "react";
import { FolderIcon } from "./Icons";
import { useVideoContext } from "../hooks/useVideoContext";
import "../styles/file-selection.css";

interface FileSelectionPromptProps {
  onSelect: () => void;
  error: string | null;
}

export const FileSelectionPrompt: React.FC<FileSelectionPromptProps> = ({
  onSelect,
  error,
}) => {
  const { handleFileSelection } = useVideoContext();

  const handleSelect = async () => {
    try {
      await handleFileSelection();
      onSelect();
    } catch (err) {
      console.error("Error selecting folder:", err);
    }
  };

  return (
    <div className="file-selection-prompt">
      <div className="prompt-content">
        <FolderIcon size={80} className="folder-icon" />
        <h2>Select a video folder to begin</h2>
        <p>
          Choose a folder containing your video files to browse and play them
        </p>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleSelect} className="select-folder-button large">
          <FolderIcon />
          <span>Select Folder</span>
        </button>

        <div className="supported-formats">
          <h3>Supported formats</h3>
          <div className="format-tags">
            <span className="format-tag">MP4</span>
            <span className="format-tag">MOV</span>
            <span className="format-tag">AVI</span>
            <span className="format-tag">MKV</span>
            <span className="format-tag">WEBM</span>
            <span className="format-tag">FLV</span>
            <span className="format-tag">WMV</span>
            <span className="format-tag">M4V</span>
            <span className="format-tag">MPG</span>
            <span className="format-tag">3GP</span>
            <span className="format-tag">OGV</span>
            <span className="format-tag">TS</span>
            <span className="format-tag">MXF</span>
            <span className="format-tag">+50 more</span>
          </div>
          <p className="format-note">
            Note: Format support depends on your browser's capabilities. Modern
            browsers support most common formats, while specialized formats may
            require additional codecs.
          </p>
        </div>
      </div>
    </div>
  );
};
