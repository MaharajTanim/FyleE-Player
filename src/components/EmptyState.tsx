import React from 'react';
import { Search } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="empty-state">
      <Search size={48} />
      <h2>{message}</h2>
      <p>Try adjusting your search or filters</p>
    </div>
  );
};