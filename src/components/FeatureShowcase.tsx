import React, { useState, useEffect, useRef } from "react";
import { Info, CheckCircle, X } from "lucide-react";
import { detectVideoSupport, getBrowserVideoInfo } from "../utils/codecSupport";
import "../styles/feature-showcase-fixed.css";

interface FeatureShowcaseProps {
  onClose: () => void;
}

export const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("formats");
  const modalRef = useRef<HTMLDivElement>(null);
  const browserInfo = getBrowserVideoInfo();
  const codecSupport = detectVideoSupport();

  // Handle escape key and click outside to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target === modalRef.current) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const supportedFormats = [
    "mp4",
    "mov",
    "avi",
    "mkv",
    "webm",
    "ogg",
    "flv",
    "wmv",
    "m4v",
    "mpg",
    "mpeg",
    "3gp",
    "3g2",
    "f4v",
    "asf",
    "qt",
    "rm",
    "rmvb",
    "ogv",
    "ogm",
    "divx",
    "xvid",
    "vob",
    "ts",
    "m2ts",
    "mts",
    "mxf",
    "r3d",
    "gxf",
    "nsv",
    "rec",
    "mod",
    "tod",
    "dv",
    "hdv",
    "swf",
    "yuv",
    "y4m",
    "amv",
    "roq",
    "dsm",
    "ivf",
    "nut",
    "film",
    "cpk",
    "fli",
    "flc",
    "dpg",
    "smi",
    "smil",
  ];

  const newFeatures = [
    {
      title: "Expanded Format Support",
      description:
        "50+ video formats now supported including MP4, MOV, AVI, MKV, WEBM, FLV, WMV, M4V, MPG, 3GP, OGV, TS, MXF, and many more",
      status: "implemented",
    },
    {
      title: "Format Filter Dropdown",
      description:
        "Filter videos by specific formats in the header for easier navigation",
      status: "implemented",
    },
    {
      title: "Enhanced Error Handling",
      description:
        "MediaError-specific error messages with format-aware feedback and conversion suggestions",
      status: "implemented",
    },
    {
      title: "Video Information Display",
      description:
        "Shows format, resolution, bitrate, and browser compatibility in the video player overlay",
      status: "implemented",
    },
    {
      title: "Codec Detection System",
      description:
        "Comprehensive browser codec support detection for H.264, H.265, VP8, VP9, AV1, and more",
      status: "implemented",
    },
    {
      title: "Browser Compatibility Info",
      description:
        "Detailed browser support information with recommendations for optimal playback",
      status: "implemented",
    },
    {
      title: "Format-Specific Processing",
      description:
        "Optimized video processing with format-specific timeouts and better error handling",
      status: "implemented",
    },
  ];
  return (
    <div className="feature-showcase-modal" ref={modalRef}>
      <div className="feature-showcase-content">
        <div className="showcase-header">
          <div className="header-info">
            <CheckCircle size={24} className="success-icon" />
            <h2>Video Format Expansion Complete!</h2>
          </div>
          <button
            onClick={onClose}
            className="close-btn"
            title="Close showcase"
          >
            <X size={20} />
          </button>
        </div>

        <div className="showcase-tabs">
          <button
            className={`tab ${activeTab === "formats" ? "active" : ""}`}
            onClick={() => setActiveTab("formats")}
          >
            Supported Formats
          </button>
          <button
            className={`tab ${activeTab === "features" ? "active" : ""}`}
            onClick={() => setActiveTab("features")}
          >
            New Features
          </button>
          <button
            className={`tab ${activeTab === "browser" ? "active" : ""}`}
            onClick={() => setActiveTab("browser")}
          >
            Browser Support
          </button>
        </div>

        <div className="showcase-body">
          {activeTab === "formats" && (
            <div className="formats-section">
              <h3>50+ Supported Video Formats</h3>
              <p className="section-description">
                Your video player now supports a comprehensive range of video
                formats and codecs for maximum compatibility.
              </p>
              <div className="formats-grid">
                {supportedFormats.map((format) => (
                  <div key={format} className="format-chip">
                    {format.toUpperCase()}
                  </div>
                ))}
              </div>
              <div className="format-categories">
                <div className="category">
                  <h4>Common Formats</h4>
                  <p>MP4, MOV, AVI, MKV, WEBM, FLV, WMV, M4V</p>
                </div>
                <div className="category">
                  <h4>Professional Formats</h4>
                  <p>R3D, MXF, GXF, DV, HDV, ProRes containers</p>
                </div>
                <div className="category">
                  <h4>Legacy & Specialized</h4>
                  <p>MPEG, 3GP, VOB, SWF, YUV, AMV, and more</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="features-section">
              <h3>Enhanced Video Player Features</h3>
              <div className="features-list">
                {newFeatures.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <div className="feature-header">
                      <CheckCircle size={16} className="feature-icon" />
                      <h4>{feature.title}</h4>
                    </div>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "browser" && (
            <div className="browser-section">
              <h3>Your Browser Compatibility</h3>
              <div className="browser-stats">
                <div className="stat-card">
                  <div className="stat-number">
                    {browserInfo.supportedFormats.length}
                  </div>
                  <div className="stat-label">Supported Formats</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {browserInfo.recommendedFormats.length}
                  </div>
                  <div className="stat-label">Recommended Formats</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {
                      codecSupport.filter((c) => c.confidence === "probably")
                        .length
                    }
                  </div>
                  <div className="stat-label">Excellent Support</div>
                </div>
              </div>

              <div className="codec-support-preview">
                <h4>Codec Support Summary</h4>
                <div className="codec-grid">
                  {codecSupport.slice(0, 6).map((codec) => (
                    <div
                      key={codec.format}
                      className={`codec-item ${codec.confidence}`}
                    >
                      <div className="codec-name">{codec.format}</div>
                      <div className="codec-status">
                        {codec.confidence === "probably" && "✓ Excellent"}
                        {codec.confidence === "maybe" && "⚠ Partial"}
                        {!codec.supported && "✗ Not Supported"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="showcase-footer">
          <div className="footer-info">
            <Info size={16} />
            <span>All features are now active and ready to use!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
