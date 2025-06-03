import { useContext } from "react";
import { VideoContext } from "../context/VideoContext";

export const useVideoContext = () => {
  const context = useContext(VideoContext);

  if (context === undefined) {
    throw new Error(
      "useVideoContext must be used within a VideoContextProvider"
    );
  }

  return context;
};
