import { useRef, useCallback } from 'react';

export const useHoverVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const onHoverPlay = useCallback(() => {
    videoRef.current?.play().catch(e => console.warn("Video play failed", e));
  }, []);

  const onHoverPause = useCallback(() => {
    videoRef.current?.pause();
  }, []);

  return { videoRef, onHoverPlay, onHoverPause };
};
