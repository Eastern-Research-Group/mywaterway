import Extent from '@arcgis/core/geometry/Extent';
import { Component, createContext, useContext } from 'react';
// types
import type { ReactNode } from 'react';
import type { MonitoringFeatureUpdates } from 'types';

/*
## Types
*/
interface AnnualStationData {
  uniqueId: string;
  stationTotalMeasurements: number;
  stationTotalSamples: number;
  stationTotalsByCharacteristic: { [characteristic: string]: number };
  stationTotalsByGroup: { [group: string]: number };
  stationTotalsByLabel: { [label: string]: number };
}

interface DrinkingWaterDatum {
  pwsid: string;
  pws_name: string;
  primacy_agency_code: string;
  pws_type_code: string;
  pws_type: string;
  population_served_count: number;
  pws_activity_code: string;
  pws_activity: string;
  violations: string;
  geo_ind: number;
  huc12: string | null;
  upstr_ind: number;
  gw_sw_code: string;
  gw_sw: string;
  water_type_code: string | null;
  water_type_calc: string | null;
  primacy_type: string;
  tribal_code: string | null;
  tribal_name: string | null;
}

interface FetchEmptyState {
  status: 'idle' | 'fetching' | 'failure';
  data: {} | [] | null;
}

interface FetchSuccessState<Type> {
  status: 'success';
  data: Type;
}

type FetchState<Type> = FetchEmptyState | FetchSuccessState<Type>;

interface FipsData {
  countyCode: string;
  stateCode: string;
}

type FishingInfoData = Array<{ url: string; stateCode: string }>;

interface GrtsDatum {
  state: string;
  prj_seq: number;
  prj_title: string;
  total_319_funds: string;
  description: string;
  will_has_load_reductions_ind: string;
  project_type: string;
  huc_8: string;
  huc_12: string;
  pollutants: string;
  statewide_ind: string;
  project_start_date: string;
  status: string;
  project_link: string;
  ws_protect_ind: string;
}

interface GrtsData {
  items: GrtsDatum[];
  first?: { $ref: string };
  next?: { $ref: string };
  previous?: { $ref: string };
}

interface Huc12SummaryData {
  count: number;
  items: {
    assessedCatchmentAreaPercent: number;
    assessedCatchmentAreaSqMi: number;
    assessedGoodCatchmentAreaPercent: number;
    assessedGoodCatchmentAreaSqMi: number;
    assessedUnknownCatchmentAreaPercent: number;
    assessedUnknownCatchmentAreaSqMi: number;
    assessmentUnitCount: number;
    assessmentUnits: {
      assessmentUnitId: string;
    }[];
    containImpairedWatersCatchmentAreaPercent: number;
    containImpairedWatersCatchmentAreaSqMi: number;
    containRestorationCatchmentAreaPercent: number;
    containRestorationCatchmentAreaSqMi: number;
    huc12: string;
    summaryByIRCategory: {
      assessmentUnitCount: number;
      catchmentSizePercent: number;
      catchmentSizeSqMi: number;
      epaIRCategoryName: string;
    }[];
    summaryByParameterImpairments: {
      assessmentUnitCount: number;
      catchmentSizePercent: number;
      catchmentSizeSqMi: number;
      parameterGroupName: string;
    }[];
    summaryByUse: {
      useAttainmentSummary: {
        assessmentUnitCount: number;
        catchmentSizePercent: number;
        catchmentSizeSqMi: number;
        useAttainment: string;
      }[];
      useGroupName: string;
      useName: string;
    }[];
    summaryByUseGroup: {
      useAttainmentSummary: {
        assessmentUnitCount: number;
        catchmentSizePercent: number;
        catchmentSizeSqMi: number;
        useAttainment: string;
      }[];
      useGroupName: string;
    }[];
    summaryRestorationPlans: {
      assessmentUnitCount: number;
      catchmentSizePercent: number;
      catchmentSizeSqMi: number;
      summaryTypeName: string;
    }[];
    summaryVisionRestorationPlans: {
      assessmentUnitCount: number;
      catchmentSizePercent: number;
      catchmentSizeSqMi: number;
      summaryTypeName: string;
    }[];
    totalCatchmentAreaSqMi: number;
    totalHucAreaSqMi: number;
  }[];
}

interface MonitoringLocationGroups {
  [label: string]: {
    label: string;
    characteristicGroups?: Array<string>;
    stations: StationData[];
    toggled: boolean;
  };
}

interface MonitoringLocationsData {
  features: {
    geometry: {
      coordinates: [number, number];
      type: 'Point';
    };
    properties: {
      CountyName: string;
      HUCEightDigitCode: string;
      MonitoringLocationIdentifier: string;
      MonitoringLocationName: string;
      MonitoringLocationTypeName: string;
      OrganizationFormalName: string;
      OrganizationIdentifier: string;
      ProviderName: string;
      ResolvedMonitoringLocationTypeName: string;
      StateName: string;
      activityCount: string;
      characteristicGroupResultCount: {
        Physical: number;
      };
      resultCount: string;
      siteUrl: string;
    };
    type: 'Feature';
  }[];
  type: 'FeatureCollection';
}

type PermittedDischargersData = {
  Results: {
    BadSystemIDs: null;
    BioCVRows: string;
    BioV3Rows: string;
    CVRows: string;
    FEARows: string;
    Facilities: {
      CWPFormalEaCnt: string;
      CWPInspectionCount: string;
      CWPName: string;
      CWPPermitStatusDesc: string;
      CWPQtrsWithNC: string;
      CWPSNCStatus: null;
      CWPStatus: string;
      CWPViolStatus: string;
      E90Exceeds1yr: string;
      FacLat: string;
      FacLong: string;
      RegistryID: string;
      SourceID: string;
    }[];
    INSPRows: string;
    IndianCountryRows: string;
    InfFEARows: string;
    Message: string;
    PageNo: string;
    QueryID: string;
    QueryRows: string;
    SVRows: string;
    TotalPenalties: string;
    V3Rows: string;
    Version: string;
  };
};

interface ProtectedAreasData {
  features: __esri.Graphic[];
  fields: any[];
}

type State = {
  actionsLayer: __esri.GraphicsLayer | null;
  address: string;
  allWaterbodiesLayer: __esri.GroupLayer | null;
  allWaterbodiesWidgetDisabled: boolean;
  areasData: { features: __esri.Graphic[] } | null;
  areasLayer: __esri.FeatureLayer | null;
  assessmentUnitId: string;
  assessmentUnitIds: string[];
  atHucBoundaries: boolean;
  attainsPlans: FetchState<Object>;
  basemap: __esri.Basemap | string;
  boundariesLayer: __esri.GraphicsLayer | null;
  cipSummary: FetchState<Huc12SummaryData>;
  countyBoundaries: __esri.FeatureSet | null;
  currentExtent: __esri.Viewpoint | null;
  dischargersLayer: __esri.GraphicsLayer | null;
  drinkingWater: FetchState<DrinkingWaterDatum[]>;
  drinkingWaterTabIndex: number;
  errorMessage: string;
  FIPS: FetchState<FipsData>;
  fishingInfo: FetchState<FishingInfoData>;
  grts: FetchState<GrtsData>;
  highlightOptions: { color: string; fillOpacity: number };
  homeWidget: __esri.Home | null;
  huc12: string;
  hucBoundaries: __esri.FeatureSet | null;
  initialExtent: Extent;
  issuesLayer: __esri.GraphicsLayer | null;
  lastSearchText: string;
  layers: __esri.Layer[];
  linesData: { features: __esri.Graphic[] } | null;
  linesLayer: __esri.FeatureLayer | null;
  mapView: __esri.MapView | null;
  monitoringLocations: FetchState<MonitoringLocationsData>;
  monitoringLocationsLayer: __esri.FeatureLayer | null;
  nonprofits: Object;
  nonprofitsLayer: __esri.GraphicsLayer | null;
  orphanFeatures: FetchState<__esri.Graphic[]>;
  permittedDischargers: FetchState<PermittedDischargersData>;
  pointsData: { features: __esri.Graphic[] } | null;
  pointsLayer: __esri.FeatureLayer | null;
  protectedAreas: FetchState<ProtectedAreasData>;
  protectedAreasHighlightLayer: __esri.GraphicsLayer | null;
  protectedAreasLayer: __esri.MapImageLayer | null;
  providersLayer: __esri.GraphicsLayer | null;
  searchIconLayer: __esri.GraphicsLayer | null;
  searchText: string;
  selWaterbodyLayer: Object | null;
  showAllPolluted: boolean;
  statesData: FetchState<StateDatum[]>;
  summaryLayerMaxRecordCount: number | null;
  upstreamExtent: __esri.Viewpoint | null;
  upstreamLayer: (__esri.GraphicsLayer & { error?: boolean }) | null;
  upstreamLayerVisible: boolean;
  upstreamWidget: ReactNode | null;
  upstreamWidgetDisabled: boolean;
  usgsStreamgagesLayer: __esri.FeatureLayer | null;
  visibleLayers: { [layer: string]: boolean };
  watershed: string;
  waterbodyCountMismatch: boolean | null;
  waterbodyData: { features: __esri.Graphic[] } | null;
  waterbodyLayer: __esri.GroupLayer | null;
  watershedsLayerMaxRecordCount: number | null;
  wildScenicRiversData: FetchState<__esri.Graphic[]>;
  wildScenicRiversLayer: __esri.FeatureLayer | null;
  wsioHealthIndexData: FetchState<WsioHealthIndexData>;
  wsioHealthIndexLayer: __esri.FeatureLayer | null;

  // monitoring panel
  monitoringGroups: MonitoringLocationGroups | null;
  monitoringFeatureUpdates: MonitoringFeatureUpdates;

  // identified issues panel
  showDischargers: boolean;
  showPolluted: boolean;
  pollutionParameters: { [parameter: string]: boolean } | null;

  // getters
  getAllFeatures: () => __esri.Graphic[] | null;
  getAllWaterbodiesLayer: () => __esri.GroupLayer | null;
  getAllWaterbodiesWidgetDisabled: () => boolean;
  getCurrentExtent: () => __esri.Viewpoint | null;
  getHuc12: () => string;
  getHucBoundaries: () => __esri.FeatureSet | null;
  getMapView: () => __esri.MapView | null;
  getUpstreamExtent: () => __esri.Viewpoint | null;
  getUpstreamLayer: () => __esri.GraphicsLayer | null;
  getUpstreamWidgetDisabled: () => boolean;
  getWatershed: () => string;

  // setters
  resetData: () => void;
  resetMap: (useDefaultZoom: boolean) => void;
  setActionsLayer: (actionsLayer: __esri.GraphicsLayer) => void;
  setAddress: (address: string) => void;
  setAllWaterbodiesLayer: (allWaterbodiesLayer: __esri.GroupLayer) => void;
  setAllWaterbodiesWidgetDisabled: (
    allWaterbodiesWidgetDisabled: boolean,
  ) => void;
  setAreasData: (areasData: { features: __esri.Graphic[] }) => void;
  setAreasLayer: (areasLayer: __esri.FeatureLayer) => void;
  setAssessmentUnitId: (assessmentUnitId: string) => void;
  setAssessmentUnitIds: (assessmentUnitIds: string[]) => void;
  setAtHucBoundaries: (atHucBoundaries: boolean) => void;
  setAttainsPlans: (attainsPlans: FetchState<Object>) => void;
  setBasemap: (basemap: __esri.Basemap | string) => void;
  setBoundariesLayer: (boundariesLayer: __esri.GraphicsLayer) => void;
  setCipSummary: (cipSummary: FetchState<Huc12SummaryData>) => void;
  setCountyBoundaries: (countyBoundaries: __esri.FeatureSet) => void;
  setCurrentExtent: (currentExtent: __esri.Viewpoint) => void;
  setDischargersLayer: (dischargersLayer: __esri.GraphicsLayer) => void;
  setDrinkingWater: (drinkingWater: FetchState<DrinkingWaterDatum[]>) => void;
  setDrinkingWaterTabIndex: (drinkingWaterTabIndex: number) => void;
  setErrorMessage: (errorMessage: string) => void;
  setFIPS: (FIPS: FetchState<FipsData>) => void;
  setFishingInfo: (fishingInfo: FetchState<FishingInfoData>) => void;
  setGrts: (grts: FetchState<GrtsData>) => void;
  setHomeWidget: (homeWidget: __esri.Home) => void;
  setHuc12: (huc12: string) => void;
  setHucBoundaries: (hucBoundaries: __esri.FeatureSet) => void;
  setIssuesLayer: (issuesLayer: __esri.GraphicsLayer) => void;
  setLastSearchText: (lastSearchText: string) => void;
  setLayers: (layers: __esri.Layer[]) => void;
  setLinesData: (linesData: { features: __esri.Graphic[] }) => void;
  setLinesLayer: (linesLayer: __esri.FeatureLayer) => void;
  setMapView: (mapView: __esri.MapView | null) => void;
  setMonitoringFeatureUpdates: (
    monitoringFeatureUpdates: MonitoringFeatureUpdates,
  ) => void;
  setMonitoringGroups: (
    monitoringGroups: MonitoringLocationGroups | null,
  ) => void;
  setMonitoringLocations: (
    monitoringLocations: FetchState<MonitoringLocationsData>,
  ) => void;
  setMonitoringLocationsLayer: (
    monitoringLocationsLayer: __esri.FeatureLayer,
  ) => void;
  setNoDataAvailable: () => void;
  setNonprofits: (nonprofits: Object) => void;
  setNonprofitsLayer: (nonprofitsLayer: __esri.GraphicsLayer) => void;
  setOrphanFeatures: (orphanFeatures: FetchState<__esri.Graphic[]>) => void;
  setPermittedDischargers: (
    permittedDischargers: FetchState<PermittedDischargersData>,
  ) => void;
  setPointsData: (pointsData: { features: __esri.Graphic[] }) => void;
  setPointsLayer: (pointsLayer: __esri.FeatureLayer) => void;
  setPollutionParameters: (pollutionParameters: {
    [parameter: string]: boolean;
  }) => void;
  setProtectedAreas: (protectedAreas: FetchState<ProtectedAreasData>) => void;
  setProtectedAreasHighlightLayer: (
    protectedAreasHighlightLayer: __esri.GraphicsLayer,
  ) => void;
  setProtectedAreasLayer: (protectedAreasLayer: __esri.MapImageLayer) => void;
  setProvidersLayer: (providersLayer: __esri.GraphicsLayer) => void;
  setSearchIconLayer: (searchIconLayer: __esri.GraphicsLayer) => void;
  setSearchText: (searchText: string) => void;
  setSelWaterbodyLayer: (selWaterbodyLayer: Object) => void;
  setShowAllPolluted: (showAllPolluted: boolean) => void;
  setStatesData: (statesData: FetchState<StateDatum[]>) => void;
  setSummaryLayerMaxRecordCount: (summaryLayerMaxRecordCount: number) => void;
  setUpstreamExtent: (upstreamExtent: __esri.Viewpoint) => void;
  setUpstreamLayer: (
    upstreamLayer: __esri.GraphicsLayer & { error?: boolean },
  ) => void;
  setUpstreamLayerVisible: (upstreamLayerVisible: boolean) => void;
  setUpstreamWidget: (upstreamWidget: ReactNode) => void;
  setUpstreamWidgetDisabled: (upstreamWidgetDisabled: boolean) => void;
  setUsgsStreamgagesLayer: (usgsStreamgagesLayer: __esri.FeatureLayer) => void;
  setVisibleLayers: (visibleLayers: { [layer: string]: boolean }) => void;
  setWaterbodyCountMismatch: (waterbodyCountMismatch: boolean) => void;
  setWaterbodyData: (waterbodyData: { features: __esri.Graphic[] }) => void;
  setWaterbodyLayer: (waterbodyLayer: __esri.GroupLayer) => void;
  setWatershed: (watershed: string) => void;
  setWatershedsLayerMaxRecordCount: (
    watershedsLayerMaxRecordCount: number,
  ) => void;
  setWildScenicRiversData: (
    wildScenicRiversData: FetchState<__esri.Graphic[]>,
  ) => void;
  setWildScenicRiversLayer: (
    wildScenicRiversLayer: __esri.FeatureLayer,
  ) => void;
  setWsioHealthIndexData: (
    wsioHealthIndexData: FetchState<WsioHealthIndexData>,
  ) => void;
  setWsioHealthIndexLayer: (wsioHealthIndexLayer: __esri.FeatureLayer) => void;
};

interface StateDatum {
  domain: 'State';
  name: string;
  code: string;
  context: 'SYSTEM';
  id: string;
}

interface StationData {
  monitoringType: 'Past Water Conditions';
  siteId: string;
  orgId: string;
  orgName: string;
  locationLongitude: number;
  locationLatitude: number;
  locationName: string;
  locationType: string;
  locationUrl: string;
  stationDataByYear: { [year: string | number]: AnnualStationData };
  stationProviderName: string;
  stationTotalSamples: number;
  stationTotalMeasurements: number;
  stationTotalsByGroup: { [groups: string]: number };
  stationTotalsByLabel: { [label: string]: number };
  timeframe: [number, number] | null;
  uniqueId: string;
}

type WsioHealthIndexData = Array<{ states: string; phwaHealthNdxSt: number }>;

/*
## Components
*/
const LocationSearchContext = createContext<State | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export class LocationSearchProvider extends Component<Props, State> {
  state: State = {
    actionsLayer: null,
    address: '',
    allWaterbodiesLayer: null,
    allWaterbodiesWidgetDisabled: false,
    areasData: null,
    assessmentUnitId: '',
    assessmentUnitIds: [],
    atHucBoundaries: false,
    attainsPlans: { status: 'fetching', data: {} },
    basemap: 'gray-vector',
    boundariesLayer: null,
    cipSummary: { status: 'fetching', data: {} },
    countyBoundaries: null,
    currentExtent: null,
    dischargersLayer: null,
    drinkingWater: { status: 'fetching', data: [] },
    FIPS: { status: 'fetching', data: {} },
    fishingInfo: { status: 'fetching', data: [] },
    grts: { status: 'fetching', data: { items: [] } },
    homeWidget: null,
    highlightOptions: { color: '#32C5FD', fillOpacity: 1 },
    huc12: '',
    hucBoundaries: null,
    initialExtent: new Extent({
      xmin: -15634679.853814237,
      ymin: -3023256.7294788733,
      xmax: -5713765.078627277,
      ymax: 12180985.440778064,
      spatialReference: { wkid: 102100 },
    }),
    issuesLayer: null,
    lastSearchText: '',
    layers: [],
    linesData: null,
    mapView: null,
    monitoringLocations: { status: 'fetching', data: {} },
    monitoringLocationsLayer: null,
    nonprofits: { status: 'fetching', data: [] },
    nonprofitsLayer: null,
    orphanFeatures: { status: 'fetching', data: [] },
    permittedDischargers: { status: 'fetching', data: {} },
    pointsData: null,
    protectedAreas: { status: 'fetching', data: {} },
    protectedAreasHighlightLayer: null,
    protectedAreasLayer: null,
    providersLayer: null,
    searchIconLayer: null,
    searchText: '',
    selWaterbodyLayer: null,
    showDischargers: false,
    showPolluted: true,
    statesData: { status: 'fetching', data: [] },
    upstreamExtent: null,
    upstreamWidget: null,
    upstreamWidgetDisabled: false,
    usgsStreamgagesLayer: null,
    visibleLayers: {},
    waterbodyData: null,
    waterbodyLayer: null,
    waterbodyCountMismatch: null,
    watershed: '',
    wildScenicRiversData: { status: 'fetching', data: [] },
    wildScenicRiversLayer: null,
    wsioHealthIndexData: { status: 'fetching', data: [] },
    wsioHealthIndexLayer: null,
    pointsLayer: null,
    linesLayer: null,
    areasLayer: null,
    upstreamLayer: null,
    upstreamLayerVisible: false,
    errorMessage: '',
    summaryLayerMaxRecordCount: null,
    watershedsLayerMaxRecordCount: null,

    // monitoring panel
    monitoringGroups: null,
    monitoringFeatureUpdates: null,

    // identified issues panel
    showAllPolluted: true,
    pollutionParameters: null,

    // current drinking water subtab (0, 1, or 2)
    drinkingWaterTabIndex: 0,

    setSearchText: (searchText) => {
      this.setState({ searchText });
    },
    setLastSearchText: (lastSearchText) => {
      this.setState({ lastSearchText });
    },
    setMonitoringLocations: (
      monitoringLocations: FetchState<MonitoringLocationsData>,
    ) => {
      this.setState({ monitoringLocations });
    },
    setPermittedDischargers: (
      permittedDischargers: FetchState<PermittedDischargersData>,
    ) => {
      this.setState({ permittedDischargers });
    },
    setNonprofits: (nonprofits: Object) => {
      this.setState({ nonprofits });
    },
    setHucBoundaries: (hucBoundaries) => {
      this.setState({ hucBoundaries });
    },
    setCurrentExtent: (currentExtent) => {
      this.setState({ currentExtent });
    },
    setErrorMessage: (errorMessage) => {
      this.setState({ errorMessage });
    },
    setUpstreamExtent: (upstreamExtent) => {
      this.setState({ upstreamExtent });
    },
    setUpstreamWidgetDisabled: (upstreamWidgetDisabled) => {
      this.setState({ upstreamWidgetDisabled });
    },
    setAtHucBoundaries: (atHucBoundaries) => {
      this.setState({ atHucBoundaries });
    },
    setCountyBoundaries: (countyBoundaries) => {
      this.setState({ countyBoundaries });
    },
    setHuc12: (huc12) => {
      this.setState({ huc12 });
    },
    setAssessmentUnitIds: (assessmentUnitIds) => {
      this.setState({ assessmentUnitIds });
    },
    setWatershed: (watershed) => {
      this.setState({ watershed });
    },
    setFishingInfo: (fishingInfo) => {
      this.setState({ fishingInfo });
    },
    setStatesData: (statesData) => {
      this.setState({ statesData });
    },
    setWsioHealthIndexData: (wsioHealthIndexData) => {
      this.setState({ wsioHealthIndexData });
    },
    setWildScenicRiversData: (wildScenicRiversData) => {
      this.setState({ wildScenicRiversData });
    },
    setProtectedAreas: (protectedAreas) => {
      this.setState({ protectedAreas });
    },
    setAddress: (address) => {
      this.setState({ address });
    },
    setAssessmentUnitId: (assessmentUnitId) => {
      this.setState({ assessmentUnitId });
    },
    setMapView: (mapView) => {
      this.setState({ mapView });
    },
    getMapView: () => {
      return this.state.mapView;
    },
    getHuc12: () => {
      return this.state.huc12;
    },
    getWatershed: () => {
      return this.state.watershed;
    },
    getUpstreamLayer: () => {
      return this.state.upstreamLayer;
    },
    getUpstreamWidgetDisabled: () => {
      return this.state.upstreamWidgetDisabled;
    },
    getAllWaterbodiesLayer: () => {
      return this.state.allWaterbodiesLayer;
    },
    getCurrentExtent: () => {
      return this.state.currentExtent;
    },
    getUpstreamExtent: () => {
      return this.state.upstreamExtent;
    },
    getAllWaterbodiesWidgetDisabled: () => {
      return this.state.allWaterbodiesWidgetDisabled;
    },
    setLayers: (layers) => {
      this.setState({ layers });
    },
    setWaterbodyLayer: (waterbodyLayer) => {
      this.setState({ waterbodyLayer });
    },
    setIssuesLayer: (issuesLayer) => {
      this.setState({ issuesLayer });
    },
    setMonitoringLocationsLayer: (monitoringLocationsLayer) => {
      this.setState({ monitoringLocationsLayer });
    },
    setUsgsStreamgagesLayer: (usgsStreamgagesLayer) => {
      this.setState({ usgsStreamgagesLayer });
    },
    setDischargersLayer: (dischargersLayer) => {
      this.setState({ dischargersLayer });
    },
    setNonprofitsLayer: (nonprofitsLayer) => {
      this.setState({ nonprofitsLayer });
    },
    setWildScenicRiversLayer: (wildScenicRiversLayer) => {
      this.setState({ wildScenicRiversLayer });
    },
    setProtectedAreasLayer: (protectedAreasLayer) => {
      this.setState({ protectedAreasLayer });
    },
    setProtectedAreasHighlightLayer: (protectedAreasHighlightLayer) => {
      this.setState({ protectedAreasHighlightLayer });
    },
    setProvidersLayer: (providersLayer) => {
      this.setState({ providersLayer });
    },
    setBoundariesLayer: (boundariesLayer) => {
      this.setState({ boundariesLayer });
    },
    setSearchIconLayer: (searchIconLayer) => {
      this.setState({ searchIconLayer });
    },
    setActionsLayer: (actionsLayer) => {
      this.setState({ actionsLayer });
    },
    setSelWaterbodyLayer: (selWaterbodyLayer) => {
      this.setState({ selWaterbodyLayer });
    },
    setWsioHealthIndexLayer: (wsioHealthIndexLayer) => {
      this.setState({ wsioHealthIndexLayer });
    },
    setAllWaterbodiesLayer: (allWaterbodiesLayer) => {
      this.setState({ allWaterbodiesLayer });
    },
    setPointsLayer: (pointsLayer) => {
      this.setState({ pointsLayer });
    },
    setLinesLayer: (linesLayer) => {
      this.setState({ linesLayer });
    },
    setAreasLayer: (areasLayer) => {
      this.setState({ areasLayer });
    },
    setUpstreamLayer: (upstreamLayer) => {
      this.setState({ upstreamLayer });
    },
    setUpstreamLayerVisible: (upstreamLayerVisible) => {
      this.setState({ upstreamLayerVisible });
    },
    setSummaryLayerMaxRecordCount: (summaryLayerMaxRecordCount) => {
      this.setState({ summaryLayerMaxRecordCount });
    },
    setWatershedsLayerMaxRecordCount: (watershedsLayerMaxRecordCount) => {
      this.setState({ watershedsLayerMaxRecordCount });
    },
    setHomeWidget: (homeWidget) => {
      this.setState({ homeWidget });
    },
    setUpstreamWidget: (upstreamWidget) => {
      this.setState({ upstreamWidget });
    },
    setAllWaterbodiesWidgetDisabled: (allWaterbodiesWidgetDisabled) => {
      this.setState({ allWaterbodiesWidgetDisabled });
    },
    setVisibleLayers: (visibleLayers) => {
      this.setState({ visibleLayers });
    },
    setBasemap: (basemap) => {
      this.setState({ basemap });
    },
    setWaterbodyData: (waterbodyData) => {
      this.setState({ waterbodyData });
    },
    setLinesData: (linesData) => {
      this.setState({ linesData });
    },
    setOrphanFeatures: (orphanFeatures) => {
      this.setState({ orphanFeatures });
    },
    setWaterbodyCountMismatch: (waterbodyCountMismatch) => {
      this.setState({ waterbodyCountMismatch });
    },
    setAreasData: (areasData) => {
      this.setState({ areasData });
    },
    setPointsData: (pointsData) => {
      this.setState({ pointsData });
    },
    setGrts: (grts) => {
      this.setState({ grts });
    },
    setAttainsPlans: (attainsPlans) => {
      this.setState({ attainsPlans });
    },
    setDrinkingWater: (drinkingWater) => {
      this.setState({ drinkingWater });
    },
    setCipSummary: (cipSummary: FetchState<Huc12SummaryData>) => {
      this.setState({ cipSummary });
    },
    setMonitoringGroups: (monitoringGroups) => {
      this.setState({ monitoringGroups });
    },
    setMonitoringFeatureUpdates: (monitoringFeatureUpdates) => {
      this.setState({ monitoringFeatureUpdates });
    },
    setShowAllPolluted: (showAllPolluted) => {
      this.setState({ showAllPolluted });
    },
    setPollutionParameters: (pollutionParameters) => {
      this.setState({ pollutionParameters });
    },
    setDrinkingWaterTabIndex: (drinkingWaterTabIndex) => {
      this.setState({ drinkingWaterTabIndex });
    },
    setFIPS: (FIPS) => {
      this.setState({ FIPS });
    },

    /////// Functions that do more than just set a single state ////////

    getHucBoundaries: () => {
      return this.state.hucBoundaries;
    },

    getAllFeatures: () => {
      //Get the features from the context
      const { linesData, areasData, pointsData } = this.state;

      // return null if no data is available
      if (!linesData && !areasData && !pointsData) return null;

      // combine available data
      let features: __esri.Graphic[] = [];
      if (linesData) features = features.concat(linesData.features);
      if (areasData) features = features.concat(areasData.features);
      if (pointsData) features = features.concat(pointsData.features);

      return features;
    },

    resetMap: (useDefaultZoom = false) => {
      const {
        initialExtent,
        layers,
        pointsLayer,
        linesLayer,
        areasLayer,
        providersLayer,
        boundariesLayer,
        searchIconLayer,
        monitoringLocationsLayer,
        usgsStreamgagesLayer,
        upstreamLayer,
        dischargersLayer,
        nonprofitsLayer,
        protectedAreasHighlightLayer,
        mapView,
        homeWidget,
        waterbodyLayer,
        wsioHealthIndexLayer,
        wildScenicRiversLayer,
        protectedAreasLayer,
        allWaterbodiesLayer,
      } = this.state;

      // Clear waterbody layers from state
      let newState = { ...this.state };
      if (pointsLayer) newState['pointsLayer'] = null;
      if (linesLayer) newState['linesLayer'] = null;
      if (areasLayer) newState['areasLayer'] = null;
      if (waterbodyLayer) newState['waterbodyLayer'] = null;

      const layersToRemove = [
        'pointsLayer',
        'linesLayer',
        'areasLayer',
        'waterbodyLayer',
      ];

      // remove the layers from state layers list
      let removedLayers = false;
      for (let i = layers.length - 1; i >= 0; i--) {
        const item = layers[i];
        const itemId = item.id;
        if (layersToRemove.includes(itemId)) {
          layers.splice(i, 1);
          removedLayers = true;
        }
      }
      if (removedLayers) newState['layers'] = layers;

      this.setState(newState);

      // hide and remove upstream layer graphics when switching locations
      if (upstreamLayer) {
        newState['upstreamLayerVisible'] = false;
        upstreamLayer.visible = false;
        upstreamLayer.listMode = 'hide';
        upstreamLayer.graphics.removeAll();
        upstreamLayer.error = false;
      }

      // remove all map content defined in this file
      if (providersLayer) providersLayer.graphics.removeAll();
      if (boundariesLayer) boundariesLayer.graphics.removeAll();
      if (searchIconLayer) {
        searchIconLayer.visible = false;
        searchIconLayer.graphics.removeAll();
      }
      if (monitoringLocationsLayer) {
        monitoringLocationsLayer.queryFeatures().then((featureSet) => {
          monitoringLocationsLayer.applyEdits({
            deleteFeatures: featureSet.features,
          });
        });
      }
      if (usgsStreamgagesLayer) {
        usgsStreamgagesLayer.queryFeatures().then((featureSet) => {
          usgsStreamgagesLayer.applyEdits({
            deleteFeatures: featureSet.features,
          });
        });
      }
      if (dischargersLayer) dischargersLayer.graphics.removeAll();
      if (nonprofitsLayer) nonprofitsLayer.graphics.removeAll();
      if (wsioHealthIndexLayer) {
        wsioHealthIndexLayer.visible = false;
        wsioHealthIndexLayer.listMode = 'hide';
      }
      if (protectedAreasLayer) {
        protectedAreasLayer.visible = false;
        protectedAreasLayer.listMode = 'hide';
      }
      if (protectedAreasHighlightLayer) {
        protectedAreasHighlightLayer.graphics.removeAll();
      }
      if (wildScenicRiversLayer) {
        // This timeout is to workaround an issue with the wild and scenic rivers
        // layer. When turning visibility off for multiple layers with this one
        // included, the app would crash. This timeout prevents the app from
        // crashing. Similarly setting visibleLayers to {} would crash the app.
        setTimeout(() => {
          wildScenicRiversLayer.visible = false;
          wildScenicRiversLayer.listMode = 'hide';
        }, 100);
      }

      // reset the zoom and home widget to the initial extent
      if (useDefaultZoom && mapView) {
        mapView.extent = initialExtent;

        if (allWaterbodiesLayer) {
          allWaterbodiesLayer.visible = false;
          allWaterbodiesLayer.listMode = 'hide';
        }

        if (homeWidget) {
          homeWidget.viewpoint = mapView.viewpoint;
        }
      }

      // reset lines, points, and areas layers
      if (
        waterbodyLayer &&
        waterbodyLayer.layers &&
        waterbodyLayer.layers.length
      ) {
        waterbodyLayer.removeAll();
      }
    },

    resetData: () => {
      this.setState({
        huc12: '',
        assessmentUnitIds: [],
        watershed: '',
        pointsData: null,
        linesData: null,
        areasData: null,
        orphanFeatures: { status: 'fetching', data: [] },
        waterbodyCountMismatch: null,
        countyBoundaries: null,
        atHucBoundaries: false,
        hucBoundaries: null,
        monitoringGroups: null,
        monitoringFeatureUpdates: null,
        monitoringLocations: { status: 'fetching', data: {} },
        permittedDischargers: { status: 'fetching', data: {} },
        nonprofits: { status: 'fetching', data: [] },
        grts: { status: 'fetching', data: {} },
        attainsPlans: { status: 'fetching', data: {} },
        cipSummary: { status: 'fetching', data: {} },
        drinkingWater: { status: 'fetching', data: [] },
      });

      // remove map content
      // only zoom out the map if we are on the community intro page at /community
      if (window.location.pathname === '/community') {
        this.state.resetMap(true);
      } else {
        this.state.resetMap(false);
      }
    },

    setNoDataAvailable: () => {
      this.setState({
        huc12: '',
        assessmentUnitIds: [],
        watershed: '',
        pointsData: { features: [] },
        linesData: { features: [] },
        areasData: { features: [] },
        orphanFeatures: { status: 'idle', data: [] },
        waterbodyCountMismatch: null,
        countyBoundaries: null,
        monitoringLocations: { status: 'idle', data: {} },
        permittedDischargers: { status: 'idle', data: {} },
        nonprofits: { status: 'idle', data: [] },
        grts: { status: 'idle', data: {} },
        attainsPlans: { status: 'idle', data: {} },
        cipSummary: { status: 'idle', data: {} },
        drinkingWater: { status: 'idle', data: [] },
        visibleLayers: {},
      });

      // remove map content
      this.state.resetMap(true);
    },
  };

  render() {
    return (
      <LocationSearchContext.Provider value={this.state}>
        {this.props.children}
      </LocationSearchContext.Provider>
    );
  }
}

export function useLocationSearchContext() {
  const context = useContext(LocationSearchContext);
  if (context === undefined) {
    throw new Error(
      'useLocationSearchContext must be called within a LocationSearchProvider',
    );
  }
  return context;
}
