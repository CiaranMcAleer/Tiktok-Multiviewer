export type WidgetMenuItem = {
  label: string;
  type: "widget";
  widgetType: import("./widget").WidgetType;
  icon?: React.ElementType;
  description?: string;
  defaultUrl?: string; // For stream widgets, allows specifying a default stream URL
};

export type FolderMenuItem = {
  label: string;
  type: "folder";
  children: MenuItem[];
  icon?: React.ElementType;
};

export type MenuItem = WidgetMenuItem | FolderMenuItem;
