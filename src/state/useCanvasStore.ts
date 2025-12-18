// src/state/useCanvasStore.ts
import { create } from 'zustand';
import { fabric } from 'fabric';

interface CanvasStore {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  clearCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  clearCanvas: () => set({ canvas: null }),
}));