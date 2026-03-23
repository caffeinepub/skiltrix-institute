import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Award, Download, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface CertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  courseName: string;
  dateIssued: string;
  certificateId: string;
}

function drawCertificate(
  canvas: HTMLCanvasElement,
  data: {
    studentName: string;
    courseName: string;
    dateIssued: string;
    certificateId: string;
  },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = "#fefefe";
  ctx.fillRect(0, 0, W, H);

  // Outer gold border
  ctx.strokeStyle = "#b8960c";
  ctx.lineWidth = 6;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Inner blue border
  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  // Corner ornaments
  const corners: [number, number][] = [
    [40, 40],
    [W - 40, 40],
    [40, H - 40],
    [W - 40, H - 40],
  ];
  for (const [cx, cy] of corners) {
    ctx.fillStyle = "#b8960c";
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Header band
  const grad = ctx.createLinearGradient(0, 50, 0, 130);
  grad.addColorStop(0, "#1e3a8a");
  grad.addColorStop(1, "#1d4ed8");
  ctx.fillStyle = grad;
  ctx.fillRect(35, 50, W - 70, 80);

  // Institute name
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px 'Inter', sans-serif";
  ctx.fillText("SKILTRIX", W / 2, 90);

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "12px 'Inter', sans-serif";
  ctx.fillText("INSTITUTE OF EXCELLENCE", W / 2, 113);

  // Certificate of Completion
  ctx.fillStyle = "#b8960c";
  ctx.font = "italic bold 18px Georgia, serif";
  ctx.fillText("Certificate of Completion", W / 2, 168);

  // Decorative line
  ctx.strokeStyle = "#b8960c";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 178);
  ctx.lineTo(W - 80, 178);
  ctx.stroke();

  // "This is to certify"
  ctx.fillStyle = "#6b7280";
  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillText("This is to certify that", W / 2, 210);

  // Student name
  ctx.fillStyle = "#111827";
  ctx.font = "bold 32px Georgia, serif";
  ctx.fillText(data.studentName, W / 2, 252);

  // Underline
  const nameW = ctx.measureText(data.studentName).width;
  ctx.strokeStyle = "#1d4ed8";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - nameW / 2, 260);
  ctx.lineTo(W / 2 + nameW / 2, 260);
  ctx.stroke();

  // Body text
  ctx.fillStyle = "#6b7280";
  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillText("has successfully completed the program", W / 2, 292);

  // Course name
  ctx.fillStyle = "#1d4ed8";
  ctx.font = "bold 22px 'Inter', sans-serif";
  ctx.fillText(data.courseName, W / 2, 330);

  // Date and ID row
  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`Date: ${data.dateIssued}`, 80, 385);
  ctx.textAlign = "right";
  ctx.fillText(`Certificate ID: ${data.certificateId}`, W - 80, 385);

  // Decorative line above footer
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 400);
  ctx.lineTo(W - 80, 400);
  ctx.stroke();

  // Signature section
  ctx.textAlign = "center";
  ctx.fillStyle = "#374151";
  ctx.font = "italic 16px Georgia, serif";
  ctx.fillText("Director of Admissions", W / 2, 432);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "11px 'Inter', sans-serif";
  ctx.fillText("SKILTRIX Institute", W / 2, 450);

  // Gold seal circle
  ctx.beginPath();
  ctx.arc(W - 110, 430, 32, 0, Math.PI * 2);
  ctx.strokeStyle = "#b8960c";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W - 110, 430, 26, 0, Math.PI * 2);
  ctx.strokeStyle = "#b8960c";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "#b8960c";
  ctx.font = "bold 9px 'Inter', sans-serif";
  ctx.fillText("SKILTRIX", W - 110, 427);
  ctx.fillText("CERTIFIED", W - 110, 440);
}

export function CertificateModal({
  open,
  onOpenChange,
  studentName,
  courseName,
  dateIssued,
  certificateId,
}: CertificateModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (open && canvasRef.current) {
      drawCertificate(canvasRef.current, {
        studentName,
        courseName,
        dateIssued,
        certificateId,
      });
    }
  }, [open, studentName, courseName, dateIssued, certificateId]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `SKILTRIX-Certificate-${certificateId}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="certificate.dialog"
        className="sm:max-w-2xl max-h-[92vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-extrabold">
            <Award className="h-5 w-5 text-amber-500" />
            Your Certificate
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full overflow-x-auto rounded-xl border border-border shadow-card">
            <canvas
              ref={canvasRef}
              width={680}
              height={480}
              className="w-full h-auto block"
              data-ocid="certificate.canvas_target"
            />
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-ocid="certificate.close_button"
              className="flex-1 rounded-full"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
            <Button
              onClick={handleDownload}
              data-ocid="certificate.primary_button"
              className="flex-1 bg-brand-blue hover:bg-[oklch(0.52_0.19_252)] text-white rounded-full font-semibold"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PNG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
