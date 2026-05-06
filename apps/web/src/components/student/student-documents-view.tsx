"use client";

import { useState } from "react";
import { DocumentViewerModal } from "./document-viewer-modal";

interface Report {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: Date;
}

interface StudentDocumentsViewProps {
  reports: Report[];
  programUrl?: string;
  structuredPlan?: string;
}

export function StudentDocumentsView({ reports, programUrl, structuredPlan }: StudentDocumentsViewProps) {
  const [modalFile, setModalFile] = useState<{ url: string; title: string } | null>(null);

  const openModal = (url: string, title: string) => {
    setModalFile({ url, title });
  };

  const closeModal = () => {
    setModalFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Haftalık Raporlar */}
      {reports.length > 0 && (
        <section className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-indigo-900">Haftalık Analiz Raporlarım</h2>
          </div>
          <p className="mb-4 text-sm text-slate-600">
            Koçunun senin için hazırladığı detaylı gelişim analiz raporları. Seçerek sistem üzerinden görüntüleyebilirsin.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col justify-between rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="mb-3">
                  <p className="font-bold text-slate-800 line-clamp-1">{report.title}</p>
                  <p className="text-xs font-medium text-slate-500">{new Date(report.createdAt).toLocaleString("tr-TR")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openModal(report.fileUrl, report.title)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Görüntüle
                  </button>
                  <a
                    href={report.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center rounded-xl bg-slate-50 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    title="İndir"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Programlar / Dosyalar */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">Güncel Programın</h2>
            <p className="text-xs text-slate-500 mt-0.5">Koçunun senin için hazırladığı antrenman ve beslenme detayları</p>
          </div>
        </div>

        <div className="p-6">
          {structuredPlan && (
            <div className="mb-6 rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Yazılı Program Detayı</h3>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap font-medium">
                {structuredPlan}
              </div>
            </div>
          )}

          {programUrl ? (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Ekli Dosyalar</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => openModal(programUrl, "Güncel Antrenman Programı")}
                  className="flex w-full flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 shadow-md"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Sistemde Görüntüle
                </button>
                <a
                  href={programUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Dosyayı İndir
                </a>
              </div>
            </div>
          ) : !structuredPlan ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-3 rounded-full bg-slate-100 p-3 text-slate-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-600">
                Koçun henüz bir program yüklemedi.
              </p>
              <p className="text-xs text-slate-400 mt-1">Yeni bir program eklendiğinde burada görebileceksin.</p>
            </div>
          ) : null}
        </div>
      </section>

      <DocumentViewerModal
        isOpen={!!modalFile}
        onClose={closeModal}
        fileUrl={modalFile?.url || ""}
        title={modalFile?.title || ""}
      />
    </div>
  );
}
