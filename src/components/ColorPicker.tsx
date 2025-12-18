// ColorPicker.tsx - SIMPLE VERSION
import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HexColorPicker } from "react-colorful";

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
  children?: React.ReactNode;
}

export function ColorPicker({
  color = "#ffffff",
  setColor,
  children,
}: ColorPickerProps) {
  const [localColor, setLocalColor] = React.useState(color);
  const isDraggingRef = React.useRef(false);
  const lastUpdateRef = React.useRef<string>(color);

  // External color o'zgarganda localni yangilash
  React.useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalColor(color);
      lastUpdateRef.current = color;
    }
  }, [color]);

  const handleChange = (newColor: string) => {
    setLocalColor(newColor);
    
    // Faqat haqiqiy o'zgarish bo'lsa yangilash
    if (newColor !== lastUpdateRef.current) {
      lastUpdateRef.current = newColor;
      setColor(newColor);
    }
  };

  const handleMouseDown = () => {
    isDraggingRef.current = true;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    // Drag tugaganda oxirgi rangni yangilash
    if (localColor !== color) {
      setColor(localColor);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
        {children || (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-sm border border-gray-300 cursor-pointer"
              style={{ backgroundColor: localColor }}
            ></div>
          </div>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="border-none p-0 overflow-hidden" 
        align="end"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <HexColorPicker
          color={localColor}
          onChange={handleChange}
          className="w-full"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}