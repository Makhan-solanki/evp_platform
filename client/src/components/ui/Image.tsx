import React, { useState } from 'react';
import { UserIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { cn } from '@/utils';

interface ImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: 'user' | 'photo' | 'none';
  fallbackClassName?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon = 'photo',
  fallbackClassName = '',
  onError,
  onLoad,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const renderFallback = () => {
    if (fallbackIcon === 'none') return null;
    
    const iconClass = cn(
      'text-gray-400',
      fallbackClassName
    );

    if (fallbackIcon === 'user') {
      return <UserIcon className={iconClass} />;
    }
    
    return <PhotoIcon className={iconClass} />;
  };

  if (hasError) {
    return renderFallback();
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        isLoading ? 'opacity-0' : 'opacity-100',
        'transition-opacity duration-200',
        className
      )}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};
