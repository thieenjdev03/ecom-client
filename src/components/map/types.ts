import { MapProps, Projection } from "react-map-gl";

// ----------------------------------------------------------------------

export type MapBoxProps = Omit<MapProps, "fog" | "terrain"> & {
  projection?: Projection;
};

export type MapSettings = {
  minZoom: number;
  maxZoom: number;
  minPitch: number;
  maxPitch: number;
  dragPan: boolean;
  boxZoom: boolean;
  keyboard: boolean;
  touchZoom: boolean;
  dragRotate: boolean;
  scrollZoom: boolean;
  touchPitch: boolean;
  touchRotate: boolean;
  doubleClickZoom: boolean;
  touchZoomRotate: boolean;
  mapStyle?: string;
};

export type MapSettingKeys =
  | "dragPan"
  | "dragRotate"
  | "scrollZoom"
  | "touchZoom"
  | "touchRotate"
  | "keyboard"
  | "doubleClickZoom"
  | "minZoom"
  | "maxZoom"
  | "minPitch"
  | "maxPitch";
