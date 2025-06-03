import React from "react";
import { VideoCard } from "./VideoCard";
import { EmptyState } from "./EmptyState";
import { useVideoContext } from "../hooks/useVideoContext";
import "../styles/library.css";

interface LibraryProps {
  view: "grid" | "list";
  onSelectVideo: (file: File) => void;
}

export const Library: React.FC<LibraryProps> = ({ view, onSelectVideo }) => {
  const { filteredVideos } = useVideoContext();

  if (filteredVideos.length === 0) {
    return <EmptyState message="No videos match your search" />;
  }

  return (
    <div
      className={`video-library ${view === "list" ? "list-view" : "grid-view"}`}
    >
      {filteredVideos.map((video) => (
        <VideoCard
          key={video.file.name + video.meta.created}
          video={video}
          onSelect={onSelectVideo}
        />
      ))}
    </div>
  );
};
