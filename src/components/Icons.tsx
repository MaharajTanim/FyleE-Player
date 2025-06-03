import React from 'react';
import { 
  Film, 
  Grid, 
  List, 
  Moon, 
  Sun, 
  Folder, 
  Settings, 
  PlaySquare
} from 'lucide-react';

// Re-export Lucide icons with consistent styling
interface IconProps {
  size?: number;
  className?: string;
}

export const FilmIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <Film size={size} className={className} />
);

export const GridIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <Grid size={size} className={className} />
);

export const ListIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <List size={size} className={className} />
);

export const MoonIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <Moon size={size} className={className} />
);

export const SunIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <Sun size={size} className={className} />
);

export const FolderIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <Folder size={size} className={className} />
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <Settings size={size} className={className} />
);

export const PlaylistIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <PlaySquare size={size} className={className} />
);