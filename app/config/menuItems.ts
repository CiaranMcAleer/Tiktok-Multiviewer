import { AppWindow, Map, Globe2, Clock, StickyNote, Rss, CloudSun, CalendarDays, Folder, Camera } from "lucide-react";
import type { MenuItem } from "../types/menu";

/**
 * MENU CONFIG FORMAT
 *
 * Each menu item is either a folder (group) or a widget item.
 *
 * Folder:
 *   {
 *     label: string,
 *     type: "folder",
 *     children: MenuItem[],
 *     icon?: React.ElementType
 *   }
 *
 * Widget:
 *   {
 *     label: string,
 *     type: "widget",
 *     widgetType: WidgetType, // see types/widget.ts
 *     icon?: React.ElementType,
 *     description?: string
 *   }
 *
 * To add a new folder, add a new object with type "folder" and a children array.
 * To add a new widget, add a new object with type "widget" and a valid widgetType.
 *
 * WidgetType options: "tiktok" | "youtube" | "trafficcam" | "map" | "worldtime" | "website" | "notes" | "stream" | "rss" | "weather" | "twitch" | "bankholidays"
 *
 * You can nest folders/groups to any depth.
 */

export const menuItems: MenuItem[] = [
  {
    label: "Traffic Cameras",
    type: "folder",
    icon: Camera,
    children: [
      {
        label: "NI Traffic Cameras",
        type: "widget",
        widgetType: "trafficcam",
        icon: Camera,
        description: "Live NI traffic cameras"
      },
      {
        label: "Letterkenny Traffic Camera",
        type: "widget",
        widgetType: "website",
        icon: Camera,
        description: "Live Letterkenny traffic camera (official player)",
        defaultUrl: "https://g0.ipcamlive.com/player/player.php?alias=6564abbb57b78&autoplay=1&disableautofullscreen=1&disablefullscreen=1"
      }
    ]
  },
  {
    label: "Website Embed",
    type: "widget",
    widgetType: "website",
    icon: AppWindow,
    description: "Embed any website"
  },
  {
    label: "Maps & Location",
    type: "folder",
    icon: Globe2,
    children: [
      { label: "Map", type: "widget", widgetType: "map", icon: Map },
      { label: "World Time", type: "widget", widgetType: "worldtime", icon: Clock }
    ]
  },
  {
    label: "Notes & Docs",
    type: "folder",
    icon: Folder,
    children: [
      { label: "Notes", type: "widget", widgetType: "notes", icon: StickyNote },
      { label: "RSS", type: "widget", widgetType: "rss", icon: Rss }
    ]
  },
  {
    label: "Weather",
    type: "folder",
    icon: CloudSun,
    children: [
      { label: "Weather", type: "widget", widgetType: "weather", icon: CloudSun },
      { label: "Bank Holidays", type: "widget", widgetType: "bankholidays", icon: CalendarDays }
    ]
  },
  // Add more folders/widgets as needed
];


