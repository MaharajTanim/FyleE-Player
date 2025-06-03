export async function generateThumbnail(
  videoFile: File,
  quality: "low" | "medium" | "high" = "medium"
): Promise<{
  thumbnail: string;
  duration: number;
  resolution: string;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    // Set video properties for faster loading and better compatibility
    video.preload = "metadata";
    video.playsInline = true;
    video.muted = true;
    video.crossOrigin = "anonymous"; // Help with CORS issues

    // Add support for multiple video formats
    const fileExtension = videoFile.name.split(".").pop()?.toLowerCase() || "";
    const mimeType = getMimeType(fileExtension);

    // Create object URL
    const videoUrl = URL.createObjectURL(videoFile);
    video.src = videoUrl;

    // Set longer timeout for complex video formats
    const timeoutDuration = ["mkv", "avi", "flv", "wmv", "mxf"].includes(
      fileExtension
    )
      ? 15000
      : 10000;

    // Handle video metadata loading
    video.onloadedmetadata = () => {
      // Calculate thumbnail dimensions based on quality
      let width: number;
      switch (quality) {
        case "low":
          width = Math.min(video.videoWidth, 320);
          break;
        case "medium":
          width = Math.min(video.videoWidth, 480);
          break;
        case "high":
          width = Math.min(video.videoWidth, 640);
          break;
      }

      const aspectRatio = video.videoHeight / video.videoWidth;
      const height = Math.floor(width * aspectRatio);

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Seek to first frame or a bit later for better thumbnail
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      try {
        // Draw frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get thumbnail quality
        const jpegQuality =
          quality === "low" ? 0.6 : quality === "medium" ? 0.75 : 0.85;

        // Generate thumbnail
        const thumbnail = canvas.toDataURL("image/jpeg", jpegQuality);

        // Clean up
        URL.revokeObjectURL(video.src);

        resolve({
          thumbnail,
          duration: video.duration,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
        });
      } catch {
        URL.revokeObjectURL(video.src);
        reject(new Error("Failed to generate thumbnail"));
      }
    };

    // Handle errors
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(
        new Error(`Error loading video format: ${fileExtension.toUpperCase()}`)
      );
    };

    // Set timeout for loading
    const timeout = setTimeout(() => {
      URL.revokeObjectURL(video.src);
      reject(
        new Error(
          `Video loading timeout for ${fileExtension.toUpperCase()} format`
        )
      );
    }, timeoutDuration);

    video.onloadeddata = () => clearTimeout(timeout);
  });
}

// Helper function to get MIME type for different video formats
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    ogg: "video/ogg",
    ogv: "video/ogg",
    mov: "video/quicktime",
    avi: "video/x-msvideo",
    wmv: "video/x-ms-wmv",
    flv: "video/x-flv",
    mkv: "video/x-matroska",
    "3gp": "video/3gpp",
    m4v: "video/x-m4v",
    mpg: "video/mpeg",
    mpeg: "video/mpeg",
    ts: "video/mp2t",
    mxf: "application/mxf",
  };

  return mimeTypes[extension] || "video/*";
}

export async function processVideos(
  files: { file: File }[],
  quality: "low" | "medium" | "high" = "medium"
): Promise<VideoMetadata[]> {
  // Process videos in batches to prevent memory issues
  const batchSize = 3;
  const results: VideoMetadata[] = [];

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (video) => {
        try {
          const { thumbnail, duration, resolution } = await generateThumbnail(
            video.file,
            quality
          );
          return {
            file: video.file,
            thumbnail,
            meta: {
              duration,
              resolution,
              created: video.file.lastModified,
              size: video.file.size,
            },
          };
        } catch (error) {
          // Return partial metadata if thumbnail generation fails
          return {
            file: video.file,
            thumbnail: "",
            meta: {
              duration: 0,
              resolution: "Unknown",
              created: video.file.lastModified,
              size: video.file.size,
            },
          };
        }
      })
    );
    results.push(...batchResults);
  }

  return results;
}
