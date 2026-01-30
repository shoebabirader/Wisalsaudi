'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';
import { useNetworkQuality, getRecommendedQuality } from '@/hooks/useNetworkQuality';

interface VerticalVideoPlayerProps {
  videoUrl: string;
  hlsUrl: string;
  thumbnail: string;
  autoPlay?: boolean;
  muted?: boolean;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export function VerticalVideoPlayer({
  videoUrl,
  hlsUrl,
  thumbnail,
  autoPlay = true,
  muted = true,
  onEnded,
  onPlay,
  onPause,
  className = '',
}: VerticalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentQuality, setCurrentQuality] = useState<'480p' | '720p' | '1080p'>('720p');
  const [showQualityIndicator, setShowQualityIndicator] = useState(false);
  const networkInfo = useNetworkQuality();

  // Update quality based on network conditions
  useEffect(() => {
    const recommendedQuality = getRecommendedQuality(networkInfo.quality);
    
    if (recommendedQuality !== currentQuality && playerRef.current) {
      setCurrentQuality(recommendedQuality);
      setShowQualityIndicator(true);
      
      // Hide indicator after 2 seconds
      const timer = setTimeout(() => {
        setShowQualityIndicator(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [networkInfo.quality, currentQuality]);

  useEffect(() => {
    // Initialize Video.js player
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: false,
      autoplay: autoPlay,
      muted: muted,
      loop: true,
      preload: 'auto',
      fluid: false,
      fill: true,
      responsive: true,
      poster: thumbnail,
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
        },
      },
      sources: [
        {
          src: hlsUrl,
          type: 'application/x-mpegURL',
        },
        {
          src: videoUrl,
          type: 'video/mp4',
        },
      ],
    });

    playerRef.current = player;

    // Event listeners
    player.on('play', () => {
      setIsPlaying(true);
      onPlay?.();
    });

    player.on('pause', () => {
      setIsPlaying(false);
      onPause?.();
    });

    player.on('ended', () => {
      onEnded?.();
    });

    // Monitor quality changes from HLS
    player.on('loadedmetadata', () => {
      const tech = player.tech({ IWillNotUseThisInPlugins: true });
      if (tech && (tech as any).vhs) {
        const vhs = (tech as any).vhs;
        
        // Listen for quality changes
        vhs.on('loadedplaylist', () => {
          const playlists = vhs.playlists?.media?.();
          if (playlists) {
            // Detect current quality from bandwidth
            const bandwidth = playlists.attributes?.BANDWIDTH;
            if (bandwidth) {
              if (bandwidth > 3000000) {
                setCurrentQuality('1080p');
              } else if (bandwidth > 1500000) {
                setCurrentQuality('720p');
              } else {
                setCurrentQuality('480p');
              }
            }
          }
        });
      }
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [hlsUrl, videoUrl, thumbnail, autoPlay, muted, onEnded, onPlay, onPause]);

  const handleTap = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  return (
    <div
      className={`relative w-full h-full bg-black ${className}`}
      onClick={handleTap}
    >
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered w-full h-full object-contain"
        playsInline
        webkit-playsinline="true"
      />
      
      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Quality indicator */}
      {showQualityIndicator && (
        <div className="absolute top-4 start-4 bg-black/70 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium pointer-events-none animate-fade-in">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              networkInfo.quality === 'high' ? 'bg-green-400' :
              networkInfo.quality === 'medium' ? 'bg-yellow-400' :
              networkInfo.quality === 'low' ? 'bg-orange-400' :
              'bg-red-400'
            }`} />
            <span>{currentQuality}</span>
          </div>
        </div>
      )}

      {/* Offline indicator */}
      {networkInfo.quality === 'offline' && (
        <div className="absolute top-4 start-4 bg-red-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium pointer-events-none">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            <span>Offline</span>
          </div>
        </div>
      )}
    </div>
  );
}
