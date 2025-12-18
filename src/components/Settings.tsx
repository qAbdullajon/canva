import { useEffect, useState } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { fabric } from "fabric";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Image, Tally4 } from "lucide-react";
import { ColorPicker } from "./ColorPicker";
import { HexColorInput } from "react-colorful";
import { Button } from "./ui/button";
import { useSettingsStore } from "@/state/useSettingsStore";
import { useCanvasStore } from "@/state/useCanvasStore";
import type { SettingsOptions } from "@/types/type";

const Settings = () => {
  const [mode, setMode] = useState<"settings" | "styles">("settings");
  const { options, formats, changeOption } = useSettingsStore();
  const [width, setWidth] = useState(options.width);
  const [height, setHeight] = useState(options.height);
  const [colLine, setColLine] = useState(options.colLine);
  const [rowLine, setRowLine] = useState(options.rowLine);
  const { canvas } = useCanvasStore();

  // Canvas komponentida yoki useCanvasStore'da
  useEffect(() => {
    if (canvas) {
      canvas.setWidth(options.width);
      canvas.setHeight(options.height);

      updateGuidelines(canvas, options);
      canvas.backgroundColor = options.bgColor;
    }
  }, [options, canvas]);

  const updateGuidelines = (
    canvas: fabric.Canvas,
    options: SettingsOptions
  ) => {
    // Eski chiziqlarni tozalash
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "line") canvas.remove(obj);
    });

    // Agar chiziqlar ko‘rinishi kerak bo‘lsa
    if (options.isHideLine) {
      const rowCount = options.rowLine;
      for (let i = 0; i < rowCount; i++) {
        const y = ((i + 1) * options.height) / (rowCount + 1);
        const horizontalLine = new fabric.Line([0, y, options.width, y], {
          stroke: "rgba(0, 0, 0, 0.1)",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        canvas.add(horizontalLine);
      }

      // ----- VERTICAL CHIZIQLAR -----
      const colCount = options.colLine;
      for (let i = 0; i < colCount; i++) {
        const x = ((i + 1) * options.width) / (colCount + 1);
        const verticalLine = new fabric.Line([x, 0, x, options.height], {
          stroke: "rgba(0, 0, 0, 0.1)",
          strokeWidth: 1,
          selectable: false,
          evented: false,
          hoverCursor: "default",
        });
        canvas.add(verticalLine);
      }
    }

    canvas.renderAll();
  };

  const handleChangeSelect = (val: string) => {
    const selectFormat = formats.find((a) => String(a.id) === val);
    changeOption("width", selectFormat?.width);
    changeOption("height", selectFormat?.height);
  };

  // Settings komponenti ichida
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;

      // Canvas background'ini rasm bilan o'rnatish
      fabric.Image.fromURL(imageUrl, (img) => {
        // Rasmini canvas o'lchamiga moslashtirish
        img.scaleToWidth(canvas.width || options.width);
        img.scaleToHeight(canvas.height || options.height);

        // Canvas background'ini o'rnatish
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
          originX: "left",
          originY: "top",
          left: 0,
          top: 0,
        });

        // Background color'ni tozalash (agar kerak bo'lsa)
        changeOption("bgColor", "transparent");
      });
    };
    reader.readAsDataURL(file);
  };
  return (
    <div className="absolute z-50 right-4 top-1/2 -translate-y-1/2 w-[256px] h-[500px] bg-[#282a34] text-white rounded-sm">
      <div className="flex items-center border-b border-[#535765]">
        <div
          onClick={() => setMode("settings")}
          className={`w-full text-center cursor-pointer py-2.5 relative after:content-[''] after:absolute after:left-3 after:right-2 after:bottom-1 after:h-0.5 ${
            mode === "settings" ? "after:bg-white" : "after:bg-transparent"
          }  after:rounded-sm`}
        >
          Settings
        </div>
        <div
          onClick={() => setMode("styles")}
          className={`w-full text-center cursor-pointer py-2.5 relative after:content-[''] after:absolute after:left-2 after:right-3 after:bottom-1 after:h-0.5 ${
            mode === "styles" ? "after:bg-white" : "after:bg-transparent"
          }  after:rounded-sm`}
        >
          Styles
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-44px)] overflow-hidden">
        {mode === "settings" ? (
          <div className="py-2">
            <div className="py-2 px-3 flex flex-col gap-2">
              <div className="pb-4 border-b border-[#535765]">
                <p className="font-bold">Canvas</p>
                <div className="flex items-center gap-6 my-2">
                  <div className="w-full flex items-center gap-2">
                    <p className="text-[#afb1b3]">W</p>
                    <Input
                      value={width}
                      onChange={(e) => setWidth(+e.target.value)}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          changeOption("width", width);
                        }
                      }}
                    />
                  </div>
                  <div className="w-full flex items-center gap-2">
                    <p className="text-[#afb1b3]">H</p>
                    <Input
                      value={height}
                      onChange={(e) => setHeight(+e.target.value)}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          changeOption("height", height);
                        }
                      }}
                    />
                  </div>
                </div>

                <Select onValueChange={handleChangeSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>

                  <SelectContent>
                    {formats.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="py-4 border-b border-[#535765]">
                <Label>
                  <Checkbox
                    onCheckedChange={(bool) => changeOption("isHideLine", bool)}
                    className="w-6 h-6"
                  />
                  <p>Hide Guidelines</p>
                </Label>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Tally4
                      className="text-[#afb1b3]"
                      size={36}
                      strokeWidth={1.5}
                    />
                    <Input
                      value={colLine}
                      onChange={(e) => setColLine(+e.target.value)}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          changeOption("colLine", colLine);
                        }
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Tally4
                      size={36}
                      strokeWidth={1.5}
                      className="rotate-z-90 text-[#afb1b3]"
                    />
                    <Input
                      value={rowLine}
                      onChange={(e) => setRowLine(+e.target.value)}
                      onFocus={(e) => {
                        e.target.select();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          changeOption("rowLine", rowLine);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="py-4 border-b border-[#535765]">
                <p>Background Color</p>
                <div className="flex items-center gap-2 mt-2">
                  <ColorPicker
                    color={options.bgColor}
                    setColor={(newColor) => changeOption("bgColor", newColor)}
                  />
                  <HexColorInput
                    color={options.bgColor}
                    onChange={(newColor) => {
                      changeOption("bgColor", newColor);
                    }}
                    className="flex h-10 w-full rounded-sm bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                    prefixed
                  />
                </div>
              </div>
              <div className="py-4">
                <input
                  type="file"
                  id="bg-image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Button
                  size={"lg"}
                  variant={"outline"}
                  onClick={() =>
                    document.getElementById("bg-image-upload")?.click()
                  }
                >
                  <Image size={32} />
                  <p>Upload Background Image</p>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </ScrollArea>
    </div>
  );
};

export default Settings;
