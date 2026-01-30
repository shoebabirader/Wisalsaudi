'use client';

import { useState, useRef, useEffect } from 'react';

interface ProductVideo {
  id: string;
  url: string;
  hlsUrl: string;
  thumbnail: string;
  duration: number;
  order: number;
  views?: number;
  likes?: number;
}

interface VideoGalleryProps {
  videos: ProductVideo[];
  productName: string;
}

export function VideoGallery({ videos, productName }: VideoGalleryProps) {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedVideo = videos[selectedVideoIndex];

  useEffect(() => {
    // Reset playing state when video changes
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [selectedVideoIndex]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No videos available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Video Player */}
      <div
        ref={containerRef}
        className="relative aspect-square bg-black rounded-lg overflow-hidden group"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={selectedVideo.thumbnail}
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={selectedVideo.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Controls Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {!isPlaying && (
              <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </button>

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            {/* Duration */}
            <span className="text-white text-sm font-medium">
              {formatDuration(selectedVideo.duration)}
            </span>

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullscreen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Video Counter */}
        {videos.length > 1 && (
          <div className="absolute top-4 end-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {selectedVideoIndex + 1} / {videos.length}
          </div>
        )}
      </div>

      {/* Video Thumbnails Carousel */}
      {videos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {videos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => setSelectedVideoIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedVideoIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={video.thumbnail}
                alt={`${productName} video ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Play Icon Overlay */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* Duration Badge */}
              <div className="absolute bottom-1 end-1 bg-black/70 text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Video Stats */}
      {(selectedVideo.views || selectedVideo.likes) && (
        <div className="flex items-center gap-4 text-sm text-gray-600">
          {selectedVideo.views !== undefined && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{selectedVideo.views.toLocaleString()} views</span>
            </div>
          )}
          {selectedVideo.likes !== undefined && (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{selectedVideo.likes.toLocaleString()} likes</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
