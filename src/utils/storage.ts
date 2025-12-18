export const loadFromLocal = (canvas: fabric.Canvas) => {
  const saved = localStorage.getItem("whiteboard");
  if (!saved) return;

  canvas.loadFromJSON(saved, () => {
    canvas.renderAll();
  });
};

// LOCAL STORAGE GA SAQLASH
export const saveToLocal = (canvas: fabric.Canvas) => {
  if (!canvas) return;

  const json = canvas.toJSON();
  localStorage.setItem("whiteboard", JSON.stringify(json));
};
