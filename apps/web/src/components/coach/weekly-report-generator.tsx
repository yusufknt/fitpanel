"use client";

import { useState, useRef } from "react";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import { TrendChart } from "./trend-chart";
import { sendWeeklyReport } from "@/app/coach/actions";

export type WeeklyReportData = {
  studentId: string;
  studentName: string;
  progressScore: number;
  complianceScore: number;
  nutritionScore: number;
  trainingScore: number;
  coachSummary: string;
  latestWeight: number | null;
  weightDelta: number | null;
  complianceDelta: number | null;
  bmi: number | null;
  weightPoints: { dateLabel: string; value: number }[];
  waistPoints: { dateLabel: string; value: number }[];
  latestCheckIn: {
    dateLabel: string;
    mood: string | null;
    complianceScore: number | null;
    notes: string | null;
    coachFeedback: string | null;
  } | null;
};

export function WeeklyReportGenerator({ data }: { data: WeeklyReportData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const generatePDF = async (): Promise<Blob | null> => {
    if (!reportRef.current) return null;
    setIsGenerating(true);
    setMessage(null);
    try {
      // html-to-image ile div'in fotografini cek (modern CSS color formatlarini destekler)
      const imgData = await toJpeg(reportRef.current, {
        pixelRatio: 2,
        quality: 0.85,
        backgroundColor: "#f8fafc", // bg-slate-50
      });

      // PDF boyutunu a4 olarak ayarla
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      // Resmin asıl boyutunu hesaplamak için bir image objesi kullanalım
      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => { img.onload = resolve; });

      const pdfHeight = (img.height * pdfWidth) / img.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      
      return pdf.output("blob");
    } catch (error) {
      console.error("PDF olusturulurken hata:", error);
      setMessage({ type: "error", text: "PDF oluşturulurken bir hata oluştu." });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const blob = await generatePDF();
    if (!blob) return;
    
    // Blob'u indirilebilir dosyaya cevir
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Haftalik_Analiz_${data.studentName.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleSendToStudent = async () => {
    const blob = await generatePDF();
    if (!blob) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("studentId", data.studentId);
      formData.append("pdfFile", blob, `report.pdf`);
      formData.append("title", `${new Date().toLocaleDateString("tr-TR")} Haftalık Analiz Raporu`);

      // Server Action
      const result = await sendWeeklyReport(formData);

      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Rapor başarıyla öğrenciye gönderildi." });
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
      >
        Haftalık Analiz Raporu (PDF)
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-slate-50 shadow-2xl">
            
            {/* Header Actions */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
              <h3 className="text-lg font-bold text-slate-800">Rapor Önizleme</h3>
              <div className="flex items-center gap-3">
                {message && (
                  <span className={`text-sm font-semibold ${message.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>
                    {message.text}
                  </span>
                )}
                <button
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="rounded-lg bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-200 disabled:opacity-50"
                >
                  PDF İndir
                </button>
                <button
                  onClick={handleSendToStudent}
                  disabled={isGenerating}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 shadow"
                >
                  {isGenerating ? "İşleniyor..." : "Öğrenciye Gönder"}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-2 rounded-lg bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                >
                  Kapat
                </button>
              </div>
            </div>

            {/* A4 Report Content */}
            <div className="p-8 flex justify-center">
              <div 
                ref={reportRef} 
                className="w-[794px] bg-white p-10 shadow-sm border border-slate-100 rounded-lg overflow-hidden relative"
                style={{ minHeight: '1123px' }} // A4 oranı
              >
                {/* Header */}
                <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                  <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">HAFTALIK<br/>ANALİZ</h1>
                    <p className="mt-2 text-lg font-medium text-slate-500">FitPanel Akıllı Rapor Sistemi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-800">{data.studentName}</p>
                    <p className="text-sm font-semibold text-slate-500">{new Date().toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Gelişim Puanı</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{data.progressScore}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Uyum Puanı</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{data.complianceScore}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Beslenme Puanı</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{data.nutritionScore}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 text-center">
                    <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Antrenman Puanı</p>
                    <p className="text-3xl font-black text-slate-900 mt-2">{data.trainingScore}</p>
                  </div>
                </div>

                {/* Coach Summary */}
                <div className="mb-8 bg-sky-50 rounded-2xl p-6 border border-sky-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-sky-900">Koç Özeti</h2>
                  </div>
                  <p className="text-sky-950 font-medium leading-relaxed">{data.coachSummary}</p>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="scale-90 origin-top-left w-[111%]">
                    <TrendChart 
                      title="Kilo Trendi" 
                      unit="kg" 
                      points={data.weightPoints} 
                      colorClass="text-sky-600" 
                    />
                  </div>
                  <div className="scale-90 origin-top-left w-[111%]">
                    <TrendChart 
                      title="Bel Ölçüsü Trendi" 
                      unit="cm" 
                      points={data.waistPoints} 
                      colorClass="text-emerald-600" 
                    />
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Current Status */}
                  <div className="border border-slate-200 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Güncel Durum</h2>
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-600">Güncel Kilo</span>
                        <span className="font-bold text-slate-900">{data.latestWeight ?? "—"} kg</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-600">Kilo Değişimi (Önceki)</span>
                        <span className="font-bold text-slate-900">
                          {data.weightDelta != null ? `${data.weightDelta > 0 ? "+" : ""}${data.weightDelta.toFixed(1)} kg` : "—"}
                        </span>
                      </li>
                      <li className="flex justify-between border-b border-slate-100 pb-2">
                        <span className="text-slate-600">VKİ (BMI)</span>
                        <span className="font-bold text-slate-900">{data.bmi != null ? data.bmi.toFixed(1) : "—"}</span>
                      </li>
                      <li className="flex justify-between pb-2">
                        <span className="text-slate-600">Uyum Puanı Değişimi</span>
                        <span className="font-bold text-slate-900">
                          {data.complianceDelta != null ? `${data.complianceDelta > 0 ? "+" : ""}${data.complianceDelta} Puan` : "—"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Latest Check In */}
                  <div className="border border-slate-200 rounded-2xl p-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Son Check-in ({data.latestCheckIn?.dateLabel ?? "Yok"})</h2>
                    {data.latestCheckIn ? (
                      <ul className="space-y-4 text-sm">
                        <li>
                          <p className="text-xs font-semibold text-slate-500 uppercase">Mod / Psikoloji</p>
                          <p className="font-medium text-slate-900 mt-1">{data.latestCheckIn.mood ?? "Belirtilmemiş"}</p>
                        </li>
                        <li>
                          <p className="text-xs font-semibold text-slate-500 uppercase">Öğrenci Notu</p>
                          <p className="font-medium text-slate-900 mt-1 italic">"{data.latestCheckIn.notes ?? "Not bırakılmamış"}"</p>
                        </li>
                        <li>
                          <p className="text-xs font-semibold text-slate-500 uppercase">Koçun Geri Bildirimi</p>
                          <p className="font-medium text-slate-900 mt-1">{data.latestCheckIn.coachFeedback ?? "Henüz değerlendirilmedi"}</p>
                        </li>
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">Henüz check-in verisi yok.</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-10 left-10 right-10 text-center border-t border-slate-200 pt-6">
                  <p className="text-xs font-medium text-slate-400">Bu rapor FitPanel sistemi tarafından otomatik oluşturulmuştur.</p>
                  <p className="text-[10px] text-slate-300 mt-1">© {new Date().getFullYear()} FitPanel Coaching</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
