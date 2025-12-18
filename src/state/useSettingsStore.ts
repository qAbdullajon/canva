import type { Format, SettingsOptions } from "@/types/type";
import { create } from "zustand";

interface SettingsStore {
  formats: Format[];
  options: SettingsOptions;
  changeOption: (key: keyof SettingsOptions, value: any) => void;
}

const formatsArray: Format[] = [
  {
    id: 1,
    name: "Business Card (525x300)",
    width: 525,
    height: 300,
  },
  {
    id: 2,
    name: "Slide 16:9 (720x405)",
    width: 720,
    height: 405,
  },
  {
    id: 3,
    name: "LinkedIn Carousel (1080x1080)",
    width: 1080,
    height: 1080,
  },
  {
    id: 4,
    name: "A4 (1241x1754)",
    width: 1240,
    height: 1754,
  },
  {
    id: 5,
    name: "Instagram (540x540)",
    width: 540,
    height: 540,
  },
  {
    id: 6,
    name: "Facebook (820x312)",
    width: 820,
    height: 312,
  },
  {
    id: 7,
    name: "LinkedIn (1128x191)",
    width: 1128,
    height: 191,
  },
  {
    id: 8,
    name: "Twitter (1500x500)",
    width: 1500,
    height: 500,
  },
  {
    id: 9,
    name: "Google (336x280)",
    width: 336,
    height: 280,
  },
];

export const useSettingsStore = create<SettingsStore>((set) => ({
  formats: formatsArray,

  options: {
    width: 540,
    height: 540,
    isHideLine: false,
    rowLine: 12,
    colLine: 12,
    bgColor: "#fff",
  },

  changeOption: (key, value) =>
    set((state) => ({
      options: {
        ...state.options,
        [key]: value,
      },
    })),
}));
