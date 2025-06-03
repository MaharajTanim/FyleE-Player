import { useState, useEffect } from 'react';

interface Settings {
  theme: 'light' | 'dark';
  view: 'grid' | 'list';
  autoplay: boolean;
  thumbnailQuality: 'low' | 'medium' | 'high';
  showSettings: boolean;
  showPlaylists: boolean;
  toggleTheme: () => void;
  toggleView: () => void;
  toggleSettings: () => void;
  togglePlaylists: () => void;
  setAutoplay: (value: boolean) => void;
  setThumbnailQuality: (quality: 'low' | 'medium' | 'high') => void;
}

export const useSettings = (): Settings => {
  // Get initial theme from system preference or localStorage
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };
  
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme());
  const [view, setView] = useState<'grid' | 'list'>(() => 
    localStorage.getItem('view') as 'grid' | 'list' || 'grid'
  );
  const [autoplay, setAutoplay] = useState(() => 
    localStorage.getItem('autoplay') !== 'false'
  );
  const [thumbnailQuality, setThumbnailQuality] = useState<'low' | 'medium' | 'high'>(() => 
    localStorage.getItem('thumbnailQuality') as 'low' | 'medium' | 'high' || 'medium'
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  
  // Apply theme to document immediately when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Save other settings when they change
  useEffect(() => {
    localStorage.setItem('view', view);
    localStorage.setItem('autoplay', String(autoplay));
    localStorage.setItem('thumbnailQuality', thumbnailQuality);
  }, [view, autoplay, thumbnailQuality]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const toggleView = () => setView(prev => prev === 'grid' ? 'list' : 'grid');
  
  const toggleSettings = () => {
    setShowSettings(prev => !prev);
    if (showPlaylists) setShowPlaylists(false);
  };
  
  const togglePlaylists = () => {
    setShowPlaylists(prev => !prev);
    if (showSettings) setShowSettings(false);
  };
  
  return {
    theme,
    view,
    autoplay,
    thumbnailQuality,
    showSettings,
    showPlaylists,
    toggleTheme,
    toggleView,
    toggleSettings,
    togglePlaylists,
    setAutoplay,
    setThumbnailQuality
  };
};