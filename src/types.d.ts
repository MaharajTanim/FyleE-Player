interface VideoMetadata {
  file: File;
  thumbnail: string;
  meta: {
    duration: number;
    resolution: string;
    created: number;
    size: number;
  };
}

interface FilterOptions {
  search: string;
  sortBy: string;
  format?: string;
}
