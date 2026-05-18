import { RefObject } from 'react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  capturePhoto: (videoRef: RefObject<HTMLVideoElement | null>, canvasRef: RefObject<HTMLCanvasElement | null>) => void;
  t: (key: string) => string;
}

export default function CameraView({ videoRef, canvasRef, capturePhoto, t }: CameraViewProps) {
  return (
    <div className="relative w-full h-[calc(100dvh-9rem)] min-h-[500px] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 shrink-0">
      <video ref={videoRef as RefObject<HTMLVideoElement>} autoPlay playsInline muted className="w-full h-full object-cover" />

      {/* Viewfinder Overlay */}
      <div className="absolute inset-0 border-[2px] border-white/20 m-8 rounded-2xl pointer-events-none">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -m-[2px]" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -m-[2px]" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -m-[2px]" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -m-[2px]" />
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex justify-center pb-safe">
        <button
          onClick={() => capturePhoto(videoRef as any, canvasRef as any)}
          className="w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center p-1 active:scale-95 transition-transform"
          aria-label={t('takePhoto')}
        >
          <div className="w-full h-full bg-white rounded-full" />
        </button>
      </div>
    </div>
  );
}
