export type ClickedHucState =
  | { status: 'fetching' | 'no-data' | 'none' | 'failure'; data: null }
  | { status: 'success'; data: { huc12: string; watershed: string } };

export interface MonitoringFeatureUpdate {
  stationTotalMeasurements: number;
  stationTotalsByGroup: { [group: string]: number };
  timeframe: [number, number];
}

export type MonitoringFeatureUpdates = {
  [locationId: string]: MonitoringFeatureUpdate;
} | null;

export interface WidgetLayer extends __esri.Layer {
  portalItem?: __esri.PortalItem;
}
