import { fabric } from "fabric";
import { useEffect, useRef, useState } from "react";

const createCornerControl = (x, y, cursor) => {
  return new fabric.Control({
    x,
    y,
    cursorStyle: cursor,
    offsetY: 0,
    offsetX: 0,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: (ctx, left, top, styleOverride, fabricObject) => {
      // Ichki qora, tashqi kulrang
      ctx.fillStyle = "white";
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(left, top, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    },
  });
};

const createSideControl = (x, y, isVertical = false) => {
  return new fabric.Control({
    x,
    y,
    cursorStyle: isVertical ? "ew-resize" : "ns-resize",
    actionHandler: isVertical
      ? fabric.controlsUtils.scalingX
      : fabric.controlsUtils.scalingY,
    render: (ctx, left, top, styleOverride, fabricObject) => {
      const controlWidth = 20;
      const controlHeight = 8;

      ctx.save();

      // Agar vertical bo'lsa, 90 gradus burish
      if (isVertical) {
        ctx.translate(left, top);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-left, -top);
      }

      const xPos = left - controlWidth / 2;
      const yPos = top - controlHeight / 2;
      const radius = controlHeight / 2;

      // Ichki qora rang
      ctx.fillStyle = "white";
      ctx.strokeStyle = "gray";
      ctx.lineWidth = 1;

      // Yumaloq chetli to'rtburchak chizish
      ctx.beginPath();
      ctx.moveTo(xPos + radius, yPos);
      ctx.lineTo(xPos + controlWidth - radius, yPos);
      ctx.arcTo(
        xPos + controlWidth,
        yPos,
        xPos + controlWidth,
        yPos + radius,
        radius
      );
      ctx.lineTo(xPos + controlWidth, yPos + controlHeight - radius);
      ctx.arcTo(
        xPos + controlWidth,
        yPos + controlHeight,
        xPos + controlWidth - radius,
        yPos + controlHeight,
        radius
      );
      ctx.lineTo(xPos + radius, yPos + controlHeight);
      ctx.arcTo(
        xPos,
        yPos + controlHeight,
        xPos,
        yPos + controlHeight - radius,
        radius
      );
      ctx.lineTo(xPos, yPos + radius);
      ctx.arcTo(xPos, yPos, xPos + radius, yPos, radius);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.restore();
    },
  });
};

const Editor = () => {
  const canvasRef = useRef(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current as HTMLCanvasElement | null;
    if (!canvasEl) return;

    const canvas = new fabric.Canvas(canvasEl, {
      backgroundColor: "white",
      selection: true,
    });
    const rect = new fabric.Rect({
      width: 200,
      height: 200,
      fill: "#919191",
      strokeWidth: 0,
      stroke: "transparent",
      left: 100,
      top: 100,
      hasBorders: true,
      hasControls: true,
      lockUniScaling: false,
      // Object o'zida stroke holatini saqlash uchun property
      allowStroke: true,
      // Cursor'lar uchun
      hoverCursor: "move",
      moveCursor: "move",
    });

    canvas.add(rect);

    rect.on("mouseover", () => {
      if (rect.allowStroke) {
        rect.set({ stroke: "#8b3dff", strokeWidth: 1 });
        canvas.requestRenderAll();
      }
    });

    // Mouse out event
    rect.on("mouseout", () => {
      if (rect.allowStroke) {
        rect.set({ stroke: "transparent", strokeWidth: 0 });
        canvas.requestRenderAll();
      }
    });

    // Selected event
    rect.on("selected", () => {
      rect.allowStroke = false;
      rect.set({ stroke: "transparent", strokeWidth: 0 });
      canvas.requestRenderAll();
    });

    // Deselected event
    rect.on("deselected", () => {
      rect.allowStroke = true;
      canvas.requestRenderAll();
    });

    canvas.on("object:moving", (e) => {
      const obj = e.target;
      obj.set({
        hasControls: false,
        hasBorders: false,
      });
      canvas.requestRenderAll();
    });
    canvas.on("mouse:up", (e) => {
      canvas.getActiveObjects().forEach((obj) => {
        obj.set({
          hasControls: true,
          hasBorders: true,
        });
      });
      canvas.requestRenderAll();
    });

    // Objects
    fabric.Object.prototype.controls = {};
    fabric.Object.prototype.padding = 0;

    fabric.Object.prototype.controls = {
      tl: createCornerControl(-0.5, -0.5, "nwse-resize"), // Chap yuqori: ↗
      tr: createCornerControl(0.5, -0.5, "nesw-resize"), // O'ng yuqori: ↖
      bl: createCornerControl(-0.5, 0.5, "nesw-resize"), // Chap past: ↙
      br: createCornerControl(0.5, 0.5, "nwse-resize"), // O'ng past: ↘
    };
    Object.assign(fabric.Object.prototype.controls, {
      mt: createSideControl(0, -0.5, false), // Yuqori: ↑↓
      mb: createSideControl(0, 0.5, false), // Past: ↑↓
      ml: createSideControl(-0.5, 0, true), // Chap: ←→
      mr: createSideControl(0.5, 0, true), // O'ng: ←→
    });

    // fabric.Object.prototype.border
    fabric.Object.prototype.borderColor = "#8b3dff";

    fabricRef.current = canvas;

    // Canvas o‘lchami
    canvas.setWidth(800);
    canvas.setHeight(500);

    return () => {
      canvas.dispose();
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Editor;
