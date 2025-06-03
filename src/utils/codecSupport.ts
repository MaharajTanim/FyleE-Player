// Video codec and format support detection utility

export interface CodecSupport {
  format: string;
  codecs: string[];
  supported: boolean;
  confidence: "probably" | "maybe" | "";
}

export function detectVideoSupport(): CodecSupport[] {
  const video = document.createElement("video");

  const formats = [
    {
      format: "MP4",
      mimeTypes: [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', // H.264 + AAC
        'video/mp4; codecs="avc1.4D401E, mp4a.40.2"', // H.264 Main + AAC
        'video/mp4; codecs="avc1.64001E, mp4a.40.2"', // H.264 High + AAC
        'video/mp4; codecs="hev1.1.6.L93.B0, mp4a.40.2"', // H.265/HEVC + AAC
      ],
    },
    {
      format: "WebM",
      mimeTypes: [
        'video/webm; codecs="vp8, vorbis"', // VP8 + Vorbis
        'video/webm; codecs="vp9, opus"', // VP9 + Opus
        'video/webm; codecs="av01.0.04M.08, opus"', // AV1 + Opus
      ],
    },
    {
      format: "OGG",
      mimeTypes: [
        'video/ogg; codecs="theora, vorbis"', // Theora + Vorbis
      ],
    },
    {
      format: "MOV",
      mimeTypes: [
        'video/quicktime; codecs="avc1.42E01E, mp4a.40.2"', // H.264 + AAC
      ],
    },
    {
      format: "AVI",
      mimeTypes: [
        "video/x-msvideo", // Basic AVI
      ],
    },
    {
      format: "MKV",
      mimeTypes: [
        'video/x-matroska; codecs="avc1.42E01E, mp4a.40.2"', // H.264 + AAC in MKV
      ],
    },
  ];

  const supportResults: CodecSupport[] = [];

  formats.forEach(({ format, mimeTypes }) => {
    let bestSupport: "" | "maybe" | "probably" = "";
    const supportedCodecs: string[] = [];

    mimeTypes.forEach((mimeType) => {
      const support = video.canPlayType(mimeType);
      if (support) {
        if (
          support === "probably" ||
          (support === "maybe" && bestSupport !== "probably")
        ) {
          bestSupport = support as "probably" | "maybe";
        }
        supportedCodecs.push(mimeType);
      }
    });

    supportResults.push({
      format,
      codecs: supportedCodecs,
      supported: bestSupport !== "",
      confidence: bestSupport,
    });
  });

  return supportResults;
}

export function getBrowserVideoInfo(): {
  userAgent: string;
  supportedFormats: string[];
  recommendedFormats: string[];
} {
  const support = detectVideoSupport();
  const supportedFormats = support
    .filter((s) => s.supported)
    .map((s) => s.format);

  const recommendedFormats = support
    .filter((s) => s.confidence === "probably")
    .map((s) => s.format);

  return {
    userAgent: navigator.userAgent,
    supportedFormats,
    recommendedFormats,
  };
}

export function getFormatRecommendation(fileName: string): {
  likely: boolean;
  message: string;
  alternative?: string;
} {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  const support = detectVideoSupport();

  // Map file extensions to format names
  const extensionToFormat: Record<string, string> = {
    mp4: "MP4",
    m4v: "MP4",
    webm: "WebM",
    ogv: "OGG",
    ogg: "OGG",
    mov: "MOV",
    qt: "MOV",
    avi: "AVI",
    mkv: "MKV",
    flv: "FLV",
    wmv: "WMV",
  };

  const format = extensionToFormat[extension];
  if (!format) {
    return {
      likely: false,
      message: `Unknown format: ${extension.toUpperCase()}. Browser support uncertain.`,
      alternative: "MP4",
    };
  }

  const formatSupport = support.find((s) => s.format === format);
  if (!formatSupport) {
    return {
      likely: false,
      message: `${format} format may not be supported by your browser.`,
      alternative: "MP4",
    };
  }

  if (formatSupport.confidence === "probably") {
    return {
      likely: true,
      message: `${format} format is well supported by your browser.`,
    };
  }

  if (formatSupport.confidence === "maybe") {
    return {
      likely: true,
      message: `${format} format has partial support. Playback may work but isn't guaranteed.`,
      alternative: "MP4",
    };
  }

  return {
    likely: false,
    message: `${format} format is not supported by your browser.`,
    alternative:
      support.find((s) => s.confidence === "probably")?.format || "MP4",
  };
}
