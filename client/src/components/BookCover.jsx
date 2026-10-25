import React from 'react';

/**
 * Editorial Book Cover Generator
 * Generates an elegant, physical book cover aesthetic based on title and category.
 * Avoids boring grey placeholder boxes.
 */

const CATEGORY_THEMES = {
  'Computer Science': {
    bg: 'bg-[#123E54]',
    accent: 'border-[#4A87A8]',
    text: 'text-[#EAF2F6]',
    sub: 'text-[#96BCD0]',
    spine: 'bg-[#0B2A3A]',
    motif: 'CODE & SYSTEMS'
  },
  'Classic Literature': {
    bg: 'bg-[#4A2825]',
    accent: 'border-[#B8866E]',
    text: 'text-[#F5EEDD]',
    sub: 'text-[#D9BCAB]',
    spine: 'bg-[#311715]',
    motif: 'FOLIO EDITION'
  },
  'History & Philosophy': {
    bg: 'bg-[#2D3A34]',
    accent: 'border-[#7E988A]',
    text: 'text-[#F0EAD6]',
    sub: 'text-[#A9BEB2]',
    spine: 'bg-[#1C2420]',
    motif: 'MONOGRAPH'
  },
  'Science & Nature': {
    bg: 'bg-[#1B4353]',
    accent: 'border-[#5CA4B8]',
    text: 'text-[#E8F1F5]',
    sub: 'text-[#9AC4D0]',
    spine: 'bg-[#102D38]',
    motif: 'OBSERVATORY'
  },
  'Art & Architecture': {
    bg: 'bg-[#333E48]',
    accent: 'border-[#8EA3B0]',
    text: 'text-[#F5F5F0]',
    sub: 'text-[#B2C0C9]',
    spine: 'bg-[#222A31]',
    motif: 'DESIGN PRESS'
  },
  'Fiction & Mystery': {
    bg: 'bg-[#291F38]',
    accent: 'border-[#8A71A4]',
    text: 'text-[#F4EEF8]',
    sub: 'text-[#C5B3D6]',
    spine: 'bg-[#1A1324]',
    motif: 'PROSE CHRONICLE'
  },
  'Poetry': {
    bg: 'bg-[#3C3228]',
    accent: 'border-[#A38E75]',
    text: 'text-[#FAF5EE]',
    sub: 'text-[#D0C2AE]',
    spine: 'bg-[#272019]',
    motif: 'POETIC WORKS'
  }
};

const DEFAULT_THEME = {
  bg: 'bg-[#16587B]',
  accent: 'border-[#84B3CE]',
  text: 'text-[#FAF6EE]',
  sub: 'text-[#C2DCEB]',
  spine: 'bg-[#0E2B3D]',
  motif: 'BOOK\'D LIBRARY'
};

export const BookCover = ({
  title,
  author,
  category = 'General',
  coverUrl,
  size = 'md', // 'sm', 'md', 'lg'
  className = ''
}) => {
  const theme = CATEGORY_THEMES[category] || DEFAULT_THEME;

  const sizeClasses = {
    sm: 'w-16 h-24 text-[9px] p-1.5',
    md: 'w-36 h-52 text-[11px] p-3.5',
    lg: 'w-48 h-68 text-xs p-5'
  }[size] || 'w-36 h-52 text-[11px] p-3.5';

  if (coverUrl && coverUrl.trim().length > 0) {
    return (
      <div className={`relative rounded-sm overflow-hidden shadow-card-subtle flex-shrink-0 border border-sand ${sizeClasses} ${className}`}>
        <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative rounded-sm overflow-hidden flex flex-col justify-between flex-shrink-0 select-none transition-transform duration-200 shadow-sm border border-black/15 ${theme.bg} ${sizeClasses} ${className}`}
    >
      {/* Spine highlight bar on left */}
      <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${theme.spine} opacity-70 border-r border-white/10`} />

      {/* Decorative top header / motif */}
      <div className="pl-1.5 pt-0.5">
        <div className="flex items-center justify-between border-b border-white/15 pb-1">
          <span className={`text-[8px] font-sans tracking-widest uppercase small-caps ${theme.sub}`}>
            {theme.motif}
          </span>
          <span className="text-[7px] opacity-40 font-mono tracking-tighter">
            № {title.length * 7}
          </span>
        </div>
      </div>

      {/* Center Title and Rule */}
      <div className="pl-1.5 my-auto py-1">
        <div className={`font-serif font-bold leading-tight line-clamp-3 ${theme.text}`}>
          {title}
        </div>
        <div className="w-6 h-[1px] bg-white/30 my-1.5" />
        <div className={`font-sans tracking-wide truncate ${theme.sub}`}>
          {author}
        </div>
      </div>

      {/* Footer Category Tag */}
      <div className="pl-1.5 pt-1 border-t border-white/15 flex items-center justify-between">
        <span className={`truncate text-[8px] font-sans tracking-wider uppercase small-caps ${theme.sub}`}>
          {category}
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  );
};
