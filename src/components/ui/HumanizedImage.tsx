import { motion } from 'framer-motion';
import { useState } from 'react';

interface HumanizedImageProps {
  src: string;
  alt: string;
  className?: string;
  caption?: string;
  priority?: boolean;
}

export function HumanizedImage({ 
  src, 
  alt, 
  className = '', 
  caption,
  priority = false 
}: HumanizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`group relative overflow-hidden rounded-3xl bg-stone-100 ${className}`}>
      <motion.img
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ 
          opacity: isLoaded && !hasError ? 1 : 0.6, 
          scale: isLoaded && !hasError ? 1 : 1.05 
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      
      {/* Overlay gradient sutil para legendas */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {caption && (
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-sm font-light leading-snug opacity-95 drop-shadow-sm">{caption}</p>
        </div>
      )}

      {/* Loading state */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100">
          <div className="w-6 h-6 border-2 border-olive-300 border-t-olive-600 rounded-full animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 text-stone-400 text-sm">
          Imagem não disponível
        </div>
      )}
    </div>
  );
}
