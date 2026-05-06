"use client";

import { useEffect } from "react";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export function DocumentViewerModal({ isOpen, onClose, fileUrl, title }: DocumentViewerModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:p-6 lg:p-8">
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="text-xs font-medium text-slate-500">Sistem İçi Önizleme</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={fileUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 sm:flex sm:items-center sm:gap-2"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Cihaza İndir
            </a>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-rose-100 hover:text-rose-600"
              aria-label="Kapat"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4">
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0`}
            className="h-full w-full rounded-2xl bg-white shadow-sm"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
