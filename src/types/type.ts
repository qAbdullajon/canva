export interface Format {
  id: number;
  name: string;
  width: number;
  height: number;
}

export interface SettingsOptions {
  width: number;
  height: number;
  isHideLine: boolean;
  rowLine: number;
  colLine: number;
  bgColor: string;
}
