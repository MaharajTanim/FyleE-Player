import { useState } from 'react';

export const useVideos = () => {
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle file selection
  const handleFileSelection = async () => {
    try {
      // Clear any previous errors
      setError(null);
      
      const directoryHandle = await window.showDirectoryPicker();
      setLoading(true);
      
      // Read the directory and process videos
      const files = await readDirectory(directoryHandle);
      
      if (files.length === 0) {
        setError('No video files found in the selected folder');
        setLoading(false);
        return;
      }
      
      const processedVideos = await processVideos(files);
      setVideos(processedVideos);
      setLoading(false);
    } catch (err) {
      if (err instanceof Error) {
        // Don't set error if the user cancelled the folder selection
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred');
      }
      setLoading(false);
    }
  };
  
  return {
    videos,
    loading,
    error,
    handleFileSelection
  };
};

// Read the directory and return an array of video files
async function readDirectory(directoryHandle: FileSystemDirectoryHandle): Promise<{file: File}[]> {
  const validExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'ogg', 'flv', 'wmv'];
  const files = [];

  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (validExtensions.includes(extension)) {
        files.push({ file });
      }
    }
  }
  
  return files;
}

// Process videos and generate thumbnails
async function processVideos(files: {file: File}[]): Promise<VideoMetadata[]> {
  return Promise.all(
    files.map(async (video) => {
      try {
        const { thumbnail, duration, resolution } = await generateThumbnail(video.file);
        
        return {
          file: video.file,
          thumbnail,
          meta: {
            duration,
            resolution,
            created: video.file.lastModified,
            size: video.file.size
          }
        };
      } catch (error) {
        // Return a partial video object if thumbnail generation fails
        return {
          file: video.file,
          thumbnail: '',
          meta: {
            duration: 0,
            resolution: 'Unknown',
            created: video.file.lastModified,
            size: video.file.size
          }
        };
      }
    })
  );
}

// Generate a thumbnail for a video file
async function generateThumbnail(videoFile: File): Promise<{
  thumbnail: string;
  duration: number;
  resolution: string;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }
    
    video.preload = 'metadata';
    video.src = URL.createObjectURL(videoFile);
    
    video.onloadedmetadata = () => {
      // Seek to 1 second for the thumbnail
      video.currentTime = 1;
    };
    
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      
      resolve({
        thumbnail: dataUrl,
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`
      });
      
      URL.revokeObjectURL(video.src);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Error loading video'));
    };
  });
}