import React, { useState, useEffect } from "react";
import { Info, X } from "lucide-react";
import { detectVideoSupport, getBrowserVideoInfo } from "../utils/codecSupport";
import "../styles/browser-info.css";

interface BrowserInfoProps {
  fileName?: string;
  onClose: () => void;
}

export const BrowserInfo: React.FC<BrowserInfoProps> = ({
  fileName,
  onClose,
}) => {
  const [browserInfo, setBrowserInfo] = useState<ReturnType<
    typeof getBrowserVideoInfo
  > | null>(null);
  const [codecSupport, setCodecSupport] = useState<
    ReturnType<typeof detectVideoSupport>
  >([]);

  useEffect(() => {
    const info = getBrowserVideoInfo();
    const support = detectVideoSupport();
    setBrowserInfo(info);
    setCodecSupport(support);
  }, []);

  if (!browserInfo) return null;

  return (
    <div className="browser-info-modal">
      <div className="browser-info-content">
        <div className="browser-info-header">
          <div className="header-left">
            <Info size={24} />
            <h2>Browser Video Support</h2>
          </div>{" "}
          <button
            onClick={onClose}
            className="close-btn"
            title="Close browser info"
          >
            <X size={20} />
          </button>
        </div>

        <div className="browser-info-body">
          {fileName && (
            <div className="current-file">
              <h3>Current File: {fileName}</h3>
              <div className="file-recommendation">
                {(() => {
                  const extension =
                    fileName.split(".").pop()?.toLowerCase() || "";
                  const supportLevel = codecSupport.find(
                    (s) =>
                      s.format.toLowerCase() === extension ||
                      (extension === "mp4" && s.format === "MP4") ||
                      (extension === "webm" && s.format === "WebM") ||
                      (extension === "mov" && s.format === "MOV") ||
                      (extension === "avi" && s.format === "AVI") ||
                      (extension === "mkv" && s.format === "MKV")
                  );

                  if (supportLevel?.confidence === "probably") {
                    return (
                      <span className="support-good">
                        ✓ Excellent browser support
                      </span>
                    );
                  } else if (supportLevel?.confidence === "maybe") {
                    return (
                      <span className="support-partial">
                        ⚠ Partial browser support
                      </span>
                    );
                  } else {
                    return (
                      <span className="support-poor">
                        ✗ Limited or no browser support
                      </span>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          <div className="format-support-grid">
            <h3>Format Support in Your Browser</h3>
            <div className="support-grid">
              {codecSupport.map((format) => (
                <div
                  key={format.format}
                  className={`format-item ${format.confidence}`}
                >
                  <div className="format-name">{format.format}</div>
                  <div className="support-level">
                    {format.confidence === "probably" && (
                      <span className="support-excellent">Excellent</span>
                    )}
                    {format.confidence === "maybe" && (
                      <span className="support-partial">Partial</span>
                    )}
                    {!format.supported && (
                      <span className="support-none">Not Supported</span>
                    )}
                  </div>
                  {format.codecs.length > 0 && (
                    <div className="codec-list">
                      {format.codecs.slice(0, 2).map((codec, idx) => (
                        <span key={idx} className="codec">
                          {codec.split(";")[0].replace("video/", "")}
                        </span>
                      ))}
                      {format.codecs.length > 2 && (
                        <span className="codec">
                          +{format.codecs.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="recommendations">
            <h3>Recommendations</h3>
            <div className="rec-grid">
              <div className="rec-item">
                <h4>Best Compatibility</h4>
                <p>
                  Use <strong>MP4</strong> with H.264 codec for maximum browser
                  support.
                </p>
              </div>
              <div className="rec-item">
                <h4>Modern Browsers</h4>
                <p>
                  <strong>WebM</strong> offers excellent compression and is
                  well-supported in modern browsers.
                </p>
              </div>
              <div className="rec-item">
                <h4>Legacy Formats</h4>
                <p>
                  Formats like AVI, FLV, and WMV may require conversion for web
                  playback.
                </p>
              </div>
            </div>
          </div>

          <div className="browser-details">
            <h3>Browser Information</h3>
            <div className="browser-stats">
              <div className="stat">
                <span className="label">Supported Formats:</span>
                <span className="value">
                  {browserInfo.supportedFormats.length}
                </span>
              </div>
              <div className="stat">
                <span className="label">Recommended Formats:</span>
                <span className="value">
                  {browserInfo.recommendedFormats.length}
                </span>
              </div>
              <div className="stat">
                <span className="label">Browser:</span>
                <span className="value">
                  {(() => {
                    const ua = browserInfo.userAgent.toLowerCase();
                    if (ua.includes("chrome")) return "Chrome";
                    if (ua.includes("firefox")) return "Firefox";
                    if (ua.includes("safari")) return "Safari";
                    if (ua.includes("edge")) return "Edge";
                    return "Unknown";
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
