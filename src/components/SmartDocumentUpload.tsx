import { useState, useRef } from "react";
import { Camera, Upload, FileText, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

type DocumentType = "multa" | "cnh" | "crv";
type Confidence = "alta" | "media" | "baixa";

interface ExtractedField {
  label: string;
  value: string | number | boolean | null;
  confidence: Confidence;
  key: string;
}

interface SmartDocumentUploadProps {
  documentType: DocumentType;
  onDataExtracted: (data: Record<string, unknown>) => void;
  triggerLabel?: string;
}

const confidenceColors: Record<Confidence, string> = {
  alta: "text-velocity-green",
  media: "text-warning",
  baixa: "text-secondary",
};

const confidenceBgColors: Record<Confidence, string> = {
  alta: "bg-velocity-green/20",
  media: "bg-warning/20",
  baixa: "bg-secondary/20",
};

const docTypeLabels: Record<DocumentType, string> = {
  multa: "Multa / Notificação",
  cnh: "CNH",
  crv: "CRV / CRLV",
};

export default function SmartDocumentUpload({ documentType, onDataExtracted, triggerLabel }: SmartDocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const [rawData, setRawData] = useState<Record<string, unknown> | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setIsProcessing(false);
    setExtractedFields([]);
    setRawData(null);
    setPdfPages([]);
    setSelectedPage(0);
    setShowPageSelector(false);
    setPdfFile(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(reset, 300);
  };

  const compressImage = (file: File, maxWidth = 1280, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Não foi possível ler a imagem"));
      img.src = URL.createObjectURL(file);
    });
  };

  const renderPdfPage = async (file: File, pageNum: number, maxWidth = 1280, quality = 0.7): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1 });
    const scale = Math.min(maxWidth / viewport.width, 2);
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;
    return canvas.toDataURL("image/jpeg", quality);
  };

  const loadPdfThumbnails = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    if (numPages === 1) {
      // Single page — skip selector
      const dataUrl = await renderPdfPage(file, 1);
      return { pages: [dataUrl], single: true };
    }

    // Generate thumbnails for all pages (max 20)
    const pagesToRender = Math.min(numPages, 20);
    const thumbs: string[] = [];
    for (let i = 1; i <= pagesToRender; i++) {
      const thumb = await renderPdfPage(file, i, 400, 0.5);
      thumbs.push(thumb);
    }
    return { pages: thumbs, single: false };
  };

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 10MB", variant: "destructive" });
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      setIsProcessing(true);
      try {
        const result = await loadPdfThumbnails(file);
        if (result.single) {
          // Single page — process directly
          setPreview(result.pages[0]);
          await processImage(result.pages[0]);
        } else {
          setPdfFile(file);
          setPdfPages(result.pages);
          setSelectedPage(0);
          setShowPageSelector(true);
          setIsProcessing(false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao ler PDF";
        toast({ title: "Erro no PDF", description: message, variant: "destructive" });
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrl = await compressImage(file);
      setPreview(dataUrl);
      await processImage(dataUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar";
      toast({ title: "Erro na extração", description: message, variant: "destructive" });
      setPreview(null);
      setIsProcessing(false);
    }
  };

  const handlePageSelect = async () => {
    if (!pdfFile) return;
    setShowPageSelector(false);
    setIsProcessing(true);
    try {
      const dataUrl = await renderPdfPage(pdfFile, selectedPage + 1);
      setPreview(dataUrl);
      await processImage(dataUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar página";
      toast({ title: "Erro", description: message, variant: "destructive" });
      setIsProcessing(false);
    }
  };

  const processImage = async (dataUrl: string) => {
    try {
      const base64 = dataUrl.split(",")[1];
      const { data, error } = await supabase.functions.invoke("extract-document", {
        body: { imageBase64: base64, documentType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const extracted = data.data;
      const confianca = extracted.confianca || {};
      delete extracted.confianca;

      const fields: ExtractedField[] = Object.entries(extracted)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([key, value]) => ({
          key,
          label: formatLabel(key),
          value: value as string | number | boolean,
          confidence: (confianca[key] as Confidence) || "media",
        }));

      setExtractedFields(fields);
      setRawData(extracted);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao processar";
      toast({ title: "Erro na extração", description: message, variant: "destructive" });
      setPreview(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (rawData) {
      onDataExtracted(rawData);
      toast({ title: "Dados importados!", description: "Revise os campos preenchidos." });
      handleClose();
    }
  };

  const formatLabel = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const formatValue = (v: string | number | boolean | null) => {
    if (v === null || v === undefined) return "—";
    if (typeof v === "boolean") return v ? "Sim" : "Não";
    if (typeof v === "number") {
      return v >= 100 ? `R$ ${v.toFixed(2)}` : String(v);
    }
    return String(v);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-primary/80 to-secondary/80 text-white font-semibold gap-2"
      >
        <Camera className="w-4 h-4" />
        {triggerLabel || `Upload Inteligente — ${docTypeLabels[documentType]}`}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-md mx-auto bg-background border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-primary">
              Upload {docTypeLabels[documentType]}
            </DialogTitle>
            <DialogDescription>
              Tire uma foto ou envie uma imagem. A IA extrairá os dados automaticamente.
            </DialogDescription>
          </DialogHeader>

          {showPageSelector && pdfPages.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                PDF com {pdfPages.length} página{pdfPages.length > 1 ? "s" : ""}. Selecione a página para extrair:
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {pdfPages.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPage(i)}
                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPage === i
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <img src={thumb} alt={`Página ${i + 1}`} className="w-full h-24 object-cover" />
                    <span className="absolute bottom-0 left-0 right-0 bg-background/80 text-[10px] text-center py-0.5 font-medium">
                      Pág. {i + 1}
                    </span>
                  </button>
                ))}
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground font-semibold"
                onClick={handlePageSelect}
              >
                Extrair Página {selectedPage + 1}
              </Button>
            </div>
          )}

          {!preview && !isProcessing && !showPageSelector && (
            <div className="space-y-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <Button
                variant="outline"
                className="w-full h-20 border-dashed border-2 border-primary/40 flex flex-col gap-1"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground">Tirar Foto</span>
              </Button>

              <Button
                variant="outline"
                className="w-full h-20 border-dashed border-2 border-muted-foreground/30 flex flex-col gap-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Galeria / Arquivo</span>
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center gap-4 py-8">
              {preview && (
                <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-xl opacity-60" />
              )}
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground animate-pulse">Analisando documento com IA...</p>
            </div>
          )}

          {!isProcessing && extractedFields.length > 0 && (
            <div className="space-y-4">
              {preview && (
                <div className="relative">
                  <img src={preview} alt="Documento" className="w-full h-32 object-cover rounded-xl" />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-semibold">Dados Extraídos</h4>
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {extractedFields.length} campos
                  </span>
                </div>

                {extractedFields.map((field) => (
                  <div
                    key={field.key}
                    className="glass-card p-3 flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {field.label}
                      </p>
                      <p className="text-sm font-medium truncate">{formatValue(field.value)}</p>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-medium uppercase ${confidenceColors[field.confidence]} ${confidenceBgColors[field.confidence]}`}
                    >
                      {field.confidence}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-warning/10 border border-warning/20">
                <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
                <p className="text-[11px] text-warning">Revise os dados antes de confirmar. A IA pode cometer erros.</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={reset}>
                  Refazer
                </Button>
                <Button className="flex-1 bg-velocity-green text-black font-semibold gap-1" onClick={handleConfirm}>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
