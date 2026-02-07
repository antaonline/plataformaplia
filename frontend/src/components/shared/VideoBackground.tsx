import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  className?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export const VideoBackground = ({
  src,
  poster,
  className = "",
  overlay = true,
  overlayOpacity = 0.5,
}: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay might be blocked, that's okay
      });
    }
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Poster/Fallback while loading */}
      {!isLoaded && poster && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}

      {/* Video */}
      <motion.video
        ref={videoRef}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={poster}
        onLoadedMetadata={() => setIsLoaded(true)}
        onCanPlay={() => setIsLoaded(true)}
      >
        <source src={src} type="video/mp4" />
      </motion.video>

      {/* Gradient Overlay */}
      {overlay && (
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
};
