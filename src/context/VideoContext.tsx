import React, { createContext, useState, useEffect, useCallback } from "react";
import { processVideos } from "../utils/videoProcessor";
import { useSettings } from "../hooks/useSettings";

interface VideoContextType {
  videos: VideoMetadata[];
  filteredVideos: VideoMetadata[];
  loading: boolean;
  error: string | null;
  filter: FilterOptions;
  setFilter: React.Dispatch<React.SetStateAction<FilterOptions>>;
  handleFileSelection: () => Promise<void>;
  sortVideos: (sortBy: string) => void;
  playlist: VideoMetadata[];
  addToPlaylist: (video: VideoMetadata) => void;
  removeFromPlaylist: (index: number) => void;
  clearPlaylist: () => void;
  recentlyPlayed: VideoMetadata[];
  addToRecentlyPlayed: (video: VideoMetadata) => void;
}

export const VideoContext = createContext<VideoContextType | undefined>(
  undefined
);

interface VideoContextProviderProps {
  children: React.ReactNode;
}

export const VideoContextProvider: React.FC<VideoContextProviderProps> = ({
  children,
}) => {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterOptions>({
    search: "",
    sortBy: "name",
    format: "all",
  });
  const [playlist, setPlaylist] = useState<VideoMetadata[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<VideoMetadata[]>([]);

  const { thumbnailQuality } = useSettings();

  // Handle file selection
  const handleFileSelection = async () => {
    try {
      // Clear any previous errors
      setError(null);

      const directoryHandle = await (
        window as unknown as Window & {
          showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
        }
      ).showDirectoryPicker();
      setLoading(true);

      // Read the directory and process videos
      const files = await readDirectory(directoryHandle);

      if (files.length === 0) {
        setError("No video files found in the selected folder");
        setLoading(false);
        return;
      }

      const processedVideos = await processVideos(files, thumbnailQuality);
      setVideos(processedVideos);
      setFilteredVideos(processedVideos);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        // Don't set error if the user cancelled the folder selection
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } else {
        setError("An unknown error occurred");
      }
      setLoading(false);
    }
  };

  // Sort videos helper function
  const getSortedVideos = useCallback(
    (videosToSort: VideoMetadata[], sortBy: string) => {
      return [...videosToSort].sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.file.name.localeCompare(b.file.name);
          case "date":
            return b.meta.created - a.meta.created;
          case "size":
            return b.meta.size - a.meta.size;
          case "duration":
            return b.meta.duration - a.meta.duration;
          default:
            return 0;
        }
      });
    },
    []
  );

  // Sort videos function that works with current filteredVideos
  const sortVideos = useCallback(
    (sortBy: string) => {
      setFilteredVideos((prev) => getSortedVideos(prev, sortBy));
    },
    [getSortedVideos]
  );

  // Add video to playlist
  const addToPlaylist = (video: VideoMetadata) => {
    setPlaylist((prev) => {
      // Don't add duplicates
      if (prev.some((v) => v.file.name === video.file.name)) {
        return prev;
      }
      return [...prev, video];
    });
  };

  // Remove video from playlist
  const removeFromPlaylist = (index: number) => {
    setPlaylist((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear playlist
  const clearPlaylist = () => {
    setPlaylist([]);
  };

  // Add to recently played (keeping only latest 10)
  const addToRecentlyPlayed = (video: VideoMetadata) => {
    setRecentlyPlayed((prev) => {
      // Remove this video if it's already in the list
      const filtered = prev.filter((v) => v.file.name !== video.file.name);
      // Add it to the front and keep only the latest 10
      return [video, ...filtered].slice(0, 10);
    });
  };

  // Filter videos when search or filter options change
  useEffect(() => {
    const filtered = videos.filter((video) => {
      const matchesSearch = video.file.name
        .toLowerCase()
        .includes(filter.search.toLowerCase());

      const matchesFormat =
        filter.format === "all" ||
        video.file.name.toLowerCase().endsWith(`.${filter.format}`);

      return matchesSearch && matchesFormat;
    });

    // Apply sorting to the filtered results
    const sortedFiltered = getSortedVideos(filtered, filter.sortBy);
    setFilteredVideos(sortedFiltered);
  }, [videos, filter, getSortedVideos]);

  return (
    <VideoContext.Provider
      value={{
        videos,
        filteredVideos,
        loading,
        error,
        filter,
        setFilter,
        handleFileSelection,
        sortVideos,
        playlist,
        addToPlaylist,
        removeFromPlaylist,
        clearPlaylist,
        recentlyPlayed,
        addToRecentlyPlayed,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

// Read the directory and return an array of video files
async function readDirectory(
  directoryHandle: FileSystemDirectoryHandle
): Promise<{ file: File }[]> {
  // Comprehensive list of video file extensions
  const validExtensions = [
    // Common video formats
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "ogg",
    "flv",
    "wmv",

    // Additional video formats and codecs
    "m4v",
    "mpg",
    "mpeg",
    "mp2",
    "m2v",
    "mpe",
    "mpv",
    "mp2v",
    "3gp",
    "3g2",
    "f4v",
    "f4p",
    "f4a",
    "f4b",
    "asf",
    "wma",
    "wmv",
    "wm",
    "qt",
    "qtz",
    "qtl",
    "rm",
    "rmvb",
    "ra",
    "ram",
    "ogv",
    "ogm",
    "ogx",
    "divx",
    "xvid",
    "vob",
    "ifo",
    "bup",
    "ts",
    "m2ts",
    "mts",
    "mt2s",
    "mxf",
    "r3d",
    "gxf",
    "nsv",
    "rec",
    "trp",
    "mod",
    "tod",
    "m2t",
    "dv",
    "hdv",
    "swf",
    "yuv",
    "y4m",
    "amv",
    "roq",
    "dsm",
    "dsv",
    "dsa",
    "dss",
    "ivf",
    "nut",
    "film",
    "cpk",
    "fli",
    "flc",
    "nsv",
    "dpg",
    "smi",
    "smil",
  ];

  const files = [];

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === "file") {
      const fileHandle = entry as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const extension = file.name.split(".").pop()?.toLowerCase() || "";

      if (validExtensions.includes(extension)) {
        files.push({ file });
      }
    }
  }

  return files;
}
