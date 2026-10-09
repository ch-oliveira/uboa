'use client';

import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, ExternalLink } from 'lucide-react';

export interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
  subtitle?: string;
}

export function ImageLightboxModal({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title = 'Evidência Fotográfica',
  subtitle,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 p-2 sm:p-6 select-none">
      {/* Top action bar */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between text-white z-10 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex flex-col">
          <span className="text-sm sm:text-base font-bold flex items-center gap-2">
            <span>{title}</span>
            {images.length > 1 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                {currentIndex + 1} de {images.length}
              </span>
            )}
          </span>
          {subtitle && (
            <span className="text-xs text-white/70 mt-0.5">{subtitle}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentImage && (
            <a
              href={currentImage}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Abrir imagem original"
            >
              <ExternalLink size={18} />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={`Evidência ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl transition-all animate-in zoom-in-95 duration-150"
        />

        {/* Prev Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/20 transition-all cursor-pointer backdrop-blur-xs hover:scale-105 active:scale-95"
            title="Foto anterior"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-4 p-3 rounded-full bg-black/50 hover:bg-black/75 text-white border border-white/20 transition-all cursor-pointer backdrop-blur-xs hover:scale-105 active:scale-95"
            title="Próxima foto"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Bottom thumbnails selector if multiple images */}
      {images.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center gap-2 px-4 overflow-x-auto z-10 py-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                idx === currentIndex
                  ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-400/50'
                  : 'border-white/30 opacity-60 hover:opacity-100 hover:border-white/60'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
