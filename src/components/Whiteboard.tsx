import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { useCanvasStore } from "../state/useCanvasStore";
import { loadFromLocal, saveToLocal } from "../utils/storage";
import Settings from "./Settings";

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvas, setCanvas } = useCanvasStore();

  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const lastPos = useRef({ x: 0, y: 0 });
  const isCtrlPressed = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || canvas) return;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "white",
      preserveObjectStacking: true,
    });

    const rect = new fabric.Rect({
      width: 150,
      height: 150,
      fill: "red",
    });
    fabricCanvas.add(rect);

    fabricCanvas.setWidth(540);
    fabricCanvas.setHeight(540);
    setCanvas(fabricCanvas);

    fabricCanvas.on("object:added", () => saveToLocal(fabricCanvas));
    fabricCanvas.on("object:modified", () => saveToLocal(fabricCanvas));
    fabricCanvas.on("object:removed", () => saveToLocal(fabricCanvas));

    loadFromLocal(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, []);

  // Global key event'lar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Meta ni kuzatish
      if (e.ctrlKey || e.metaKey) {
        isCtrlPressed.current = true;
      }

      if (e.code === "Space" && !e.repeat) {
        setIsPanning(true);
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";
        e.preventDefault();
      }

      // Ctrl + 0 (reset zoom)
      if ((e.ctrlKey || e.metaKey) && e.code === "Digit0") {
        e.preventDefault();
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }

      // Ctrl + + (zoom in)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === "Equal" || e.code === "NumpadAdd")
      ) {
        e.preventDefault();
        setScale((prev) => Math.min(prev * 1.2, 5));
      }

      // Ctrl + - (zoom out)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === "Minus" || e.code === "NumpadSubtract")
      ) {
        e.preventDefault();
        setScale((prev) => Math.max(prev / 1.2, 0.1));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Ctrl/Meta qo'yilganda
      if (e.key === "Control" || e.key === "Meta") {
        isCtrlPressed.current = false;
      }

      if (e.code === "Space") {
        setIsPanning(false);
        document.body.style.overflow = "auto";
        document.body.style.touchAction = "auto";
      }
    };

    // Mouse wheel event - zoom uchun (MUHIM: passive: false)
    const handleWheel = (e: WheelEvent) => {
      // Agar Ctrl bosilgan bo'lsa, browser zoom'ini to'liq bloklash
      if (e.ctrlKey || e.metaKey || isCtrlPressed.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation?.();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const zoomFactor = 1 + delta;

        setScale((prev) => {
          const newScale = prev * zoomFactor;
          // 0.5 dan 2 gacha cheklash
          return Math.max(0.5, Math.min(2, newScale));
        });

        return false;
      }

      // Oddiy wheel - panning (agar panning rejimida bo'lsa)
      if (isPanning) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Global mouse move panning uchun
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;

      // Agar mouse bosilmagan bo'lsa
      if (!e.buttons) {
        lastPos.current = { x: e.clientX, y: e.clientY };
        return;
      }

      e.preventDefault();

      const deltaX = e.clientX - lastPos.current.x;
      const deltaY = e.clientY - lastPos.current.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      lastPos.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    // Yana bir muhim: wheel event'ni capturing phase'da ham tutish
    const handleWheelCapture = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", handleKeyUp, { passive: false });
    window.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
    window.addEventListener("wheel", handleWheelCapture, { passive: false });
    window.addEventListener("mousemove", handleGlobalMouseMove, {
      passive: false,
    });

    // Butun document uchun wheel event'ni bloklash
    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("wheel", handleWheelCapture);
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("wheel", handleWheel);
      document.body.style.overflow = "auto";
      document.body.style.touchAction = "auto";
    };
  }, [isPanning, scale]);

  // Canvas uchun alohida wheel handler
  const handleCanvasWheel = useCallback(
    (e: React.WheelEvent) => {
      // Ctrl yoki Cmd bilan
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const zoomFactor = 1 + delta;
        const newScale = Math.max(0.1, Math.min(5, scale * zoomFactor));

        // Mouse pozitsiyasiga nisbatan zoom
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom center'ni hisoblash
        const scaleChange = newScale / scale;
        setPosition((prev) => ({
          x: prev.x - (mouseX - 270) * (scaleChange - 1),
          y: prev.y - (mouseY - 270) * (scaleChange - 1),
        }));

        setScale(newScale);
        return false;
      }
    },
    [scale]
  );

  // Mouse down event
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isPanning) return;

    e.preventDefault();
    e.stopPropagation();

    lastPos.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleDoubleClick = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative h-screen w-screen bg-gray-500 overflow-hidden"
      style={{
        cursor: isPanning ? "grab" : "default",
        zoom: "reset",
      }}
      onDoubleClick={handleDoubleClick}
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <Settings />
      {/* Background layer - panning uchun katta maydon */}
      <div
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        style={{
          cursor: isPanning ? "grab" : "default",
        }}
        // Bu yerda ham wheel bloklash
        onWheel={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      />

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="absolute"
        style={{
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: "center center",
          transition: isPanning ? "none" : "transform 0.15s ease-out",
          willChange: "transform",
          left: "50%",
          top: "50%",
        }}
        onWheel={handleCanvasWheel}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
            border: "1px solid #e5e7eb",
          }}
        />
      </div>
    </div>
  );
};

export default Whiteboard;
