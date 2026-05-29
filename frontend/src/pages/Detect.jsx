import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { Play, Square, Video } from "lucide-react";
import { api } from "../api";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";

export default function Detect() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [scanCount, setScanCount] = useState(0);

  const videoConstraints = { width: 640, height: 480, facingMode: "user" };

  const drawBox = useCallback((box, name, status) => {
    const canvas = canvasRef.current;
    if (!canvas || !box) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const color =
      status === "AUTHORIZED"
        ? "#10b981"
        : status === "BLACKLISTED"
          ? "#ef4444"
          : "#f59e0b";

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    ctx.fillStyle = color;
    const labelH = 28;
    ctx.fillRect(box.x, box.y - labelH, box.width, labelH);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.fillText(`${name}`, box.x + 8, box.y - 8);
  }, []);

  const startVideoRecording = useCallback((logId) => {
    if (isRecordingRef.current || !webcamRef.current?.stream) return;

    isRecordingRef.current = true;
    setIsRecording(true);

    const stream = webcamRef.current.stream;
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const videoFile = new File([blob], "evidence.webm", { type: "video/webm" });
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("logId", logId);

      try {
        await api.post("/detect/video", formData);
      } catch (err) {
        console.error("Video upload failed", err);
      } finally {
        isRecordingRef.current = false;
        setIsRecording(false);
      }
    };

    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, 4000);
  }, []);

  const performScan = useCallback(async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then((res) => res.blob());
    const formData = new FormData();
    formData.append("image", blob, "capture.jpg");

    try {
      const res = await api.post("/detect", formData);
      setLastResult(res.data);
      setScanCount((c) => c + 1);

      if (res.data.box) {
        drawBox(res.data.box, res.data.name, res.data.status);
        if (res.data.logId && !isRecordingRef.current) {
          startVideoRecording(res.data.logId);
        }
      } else {
        canvasRef.current?.getContext("2d")?.clearRect(0, 0, 640, 480);
      }
    } catch (err) {
      console.error("Scan error:", err);
    }
  }, [drawBox, startVideoRecording]);

  useEffect(() => {
    let active = true;
    let timeoutId;

    const loop = async () => {
      if (!active || !isScanning) return;
      await performScan();
      if (active && isScanning) timeoutId = setTimeout(loop, 1200);
    };

    if (isScanning) loop();
    else canvasRef.current?.getContext("2d")?.clearRect(0, 0, 640, 480);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [isScanning, performScan]);

  return (
    <div>
      <PageHeader
        title="Live Surveillance"
        description="Real-time facial recognition at your checkpoint"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="relative mx-auto max-w-[640px] aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden ring-1 ring-slate-200">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {isScanning && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full text-white text-xs font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  LIVE
                </div>
              )}

              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                  <Video className="w-3.5 h-3.5" />
                  REC
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsScanning(!isScanning)}
                className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${
                  isScanning
                    ? "bg-red-600 hover:bg-red-700 shadow-red-600/25"
                    : "bg-brand-600 hover:bg-brand-700 shadow-brand-600/25"
                }`}
              >
                {isScanning ? (
                  <>
                    <Square className="w-5 h-5" />
                    Stop scanning
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start scanning
                  </>
                )}
              </button>
              {isScanning && (
                <span className="text-sm text-slate-600 font-medium tabular-nums">
                  {scanCount} scans completed
                </span>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Last detection">
            {lastResult ? (
              <div className="text-center py-2">
                <p className="text-2xl font-bold text-slate-900">
                  {lastResult.name}
                </p>
                <div className="mt-3 flex justify-center">
                  <Badge status={lastResult.status} />
                </div>
                {isRecording && (
                  <p className="text-xs text-red-600 mt-4 flex items-center justify-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    Saving video evidence…
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-6">
                Start scanning to see detections here
              </p>
            )}
          </Card>

          <Card title="Status legend">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Authorized visitor</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600">Unknown person</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-slate-600">Blacklisted — alert triggered</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
