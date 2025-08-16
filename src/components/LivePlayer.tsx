// src/components/LivePlayer.tsx
'use client';

interface LivePlayerProps {
  platform: 'YOUTUBE' | 'JITSI' | string;
  streamUrl: string; // This will be the YouTube Video ID or Jitsi Room Name
}

export default function LivePlayer({ platform, streamUrl }: LivePlayerProps) {
  let embedUrl = '';

  if (platform === 'YOUTUBE') {
    embedUrl = `https://www.youtube.com/embed/${streamUrl}`;
  } else if (platform === 'JITSI') {
    embedUrl = `https://meet.jit.si/${streamUrl}`;
  } else {
    return <p>Unsupported live stream platform.</p>;
  }

  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden border">
      <iframe
        src={embedUrl}
        title="Live Class Player"
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        allowFullScreen
        className="w-full h-full border-0"
      ></iframe>
    </div>
  );
}