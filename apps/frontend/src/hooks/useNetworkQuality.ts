'use client';

import { useState, useEffect } from 'react';

export type NetworkQuality = 'high' | 'medium' | 'low' | 'offline';

interface NetworkInfo {
  quality: NetworkQuality;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export function useNetworkQuality(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    quality: 'high',
  });

  useEffect(() => {
    // Check if Network Information API is available
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;

    const updateNetworkInfo = () => {
      // Check online status first
      if (!navigator.onLine) {
        setNetworkInfo({
          quality: 'offline',
        });
        return;
      }

      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink; // Mbps
        const rtt = connection.rtt; // ms
        const saveData = connection.saveData;

        let quality: NetworkQuality = 'high';

        // Determine quality based on effective type and metrics
        if (saveData) {
          quality = 'low';
        } else if (effectiveType === '4g' && downlink > 5) {
          quality = 'high';
        } else if (effectiveType === '4g' || (effectiveType === '3g' && downlink > 1.5)) {
          quality = 'medium';
        } else if (effectiveType === '3g' || effectiveType === '2g' || effectiveType === 'slow-2g') {
          quality = 'low';
        } else if (downlink < 1) {
          quality = 'low';
        } else if (downlink < 3) {
          quality = 'medium';
        }

        // Also consider RTT (round-trip time)
        if (rtt > 500) {
          quality = 'low';
        } else if (rtt > 200 && quality === 'high') {
          quality = 'medium';
        }

        setNetworkInfo({
          quality,
          effectiveType,
          downlink,
          rtt,
          saveData,
        });
      } else {
        // Fallback: assume high quality if API not available
        setNetworkInfo({
          quality: 'high',
        });
      }
    };

    // Initial check
    updateNetworkInfo();

    // Listen for changes
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
    };
  }, []);

  return networkInfo;
}

// Helper function to get recommended video quality based on network
export function getRecommendedQuality(networkQuality: NetworkQuality): '480p' | '720p' | '1080p' {
  switch (networkQuality) {
    case 'high':
      return '1080p';
    case 'medium':
      return '720p';
    case 'low':
    case 'offline':
      return '480p';
    default:
      return '720p';
  }
}
