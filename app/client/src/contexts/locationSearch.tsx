import Extent from '@arcgis/core/geometry/Extent';
import { Component, createContext } from 'react';
// types
import type { ReactNode } from 'react';
import type Basemap from '@arcgis/core/Basemap';
import type Graphic from '@arcgis/core/Graphic';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import type GroupLayer from '@arcgis/core/layers/GroupLayer';
import type Layer from '@arcgis/core/layers/Layer';
import type MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import type FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import type Viewpoint from '@arcgis/core/Viewpoint';
import type MapView from '@arcgis/core/views/MapView';
import type Home from '@arcgis/core/widgets/Home';

export const LocationSearchContext = createContext({});

interface StateData {
  domain: 'State';
  name: string;
  code: string;
  context: 'SYSTEM';
  id: string;
}

interface GrtsData {
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

type GrtsDataState = {
  status: Status;
  data: {
    items: GrtsData[];
    first?: { $ref: string };
    next?: { $ref: string };
    previous?: { $ref: string };
  };
};

type StatesDataState =
  | { status: 'fetching'; data: [] }
  | { status: 'failure'; data: [] }
  | { status: 'success'; data: StateData[] };

type FeaturesDataState =
  | { status: 'fetching'; data: [] }
  | { status: 'failure'; data: [] }
  | { status: 'success'; data: Graphic[] };

type ProtectedAreasDataState =
  | { status: 'fetching'; data: []; fields: [] }
  | { status: 'failure'; data: []; fields: [] }
  | { status: 'success'; data: Graphic[]; fields: any[] };

type Status = 'fetching' | 'success' | 'failure';

type FetchDataState = { status: Status; data: Object };

type FishingInfoState =
  | { status: 'fetching'; data: [] }
  | { status: 'failure'; data: [] }
  | { status: 'success'; data: Array<{ url: string; stateCode: string }> };

type MonitoringLocationGroups = {
  [label: string]: {
    label: string;
    characteristicGroups?: Array<string>;
    stations: StationData[];
    toggled: boolean;
  };
} | null;

interface MonitoringFeatureUpdate {
  stationTotalMeasurements: number;
  stationTotalsByGroup: { [group: string]: number };
  timeframe: [number, number];
}

interface DrinkingWaterData {
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

interface AnnualStationData {
  uniqueId: string;
  stationTotalMeasurements: number;
  stationTotalSamples: number;
  stationTotalsByCharacteristic: { [characteristic: string]: number };
  stationTotalsByGroup: { [group: string]: number };
  stationTotalsByLabel: { [label: string]: number };
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

type MonitoringLocationsData = {
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
};

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

type WsioHealthIndexDataState =
  | { status: 'fetching'; data: [] }
  | { status: 'failure'; data: [] }
  | {
      status: 'success';
      data: Array<{ states: string; phwaHealthNdxSt: number }>;
    };

type Huc12SummaryData = {
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
};

type State = {
  actionsLayer: GraphicsLayer | null;
  address: string;
  allWaterbodiesLayer: GroupLayer | null;
  allWaterbodiesWidgetDisabled: boolean;
  areasData: { features: Graphic[] } | null;
  areasLayer: FeatureLayer | null;
  assessmentUnitId: string;
  assessmentUnitIds: string[];
  atHucBoundaries: boolean;
  attainsPlans: FetchDataState;
  basemap: Basemap | string;
  boundariesLayer: GraphicsLayer | null;
  cipSummary: { status: Status; data: Huc12SummaryData | {} };
  countyBoundaries: FeatureSet | null;
  currentExtent: Viewpoint | null;
  dischargersLayer: GraphicsLayer | null;
  drinkingWater: { status: Status; data: DrinkingWaterData[] };
  drinkingWaterTabIndex: number;
  errorMessage: string;
  FIPS: { status: Status; stateCode: string; countyCode: string };
  fishingInfo: FishingInfoState;
  grts: GrtsDataState;
  highlightOptions: { color: string; fillOpacity: number };
  homeWidget: Home | null;
  huc12: string;
  hucBoundaries: FeatureSet | null;
  initialExtent: Extent;
  issuesLayer: GraphicsLayer | null;
  lastSearchText: string;
  layers: Layer[];
  linesData: { features: Graphic[] } | null;
  linesLayer: FeatureLayer | null;
  mapView: MapView | null;
  monitoringLocations: { status: Status; data: MonitoringLocationsData | {} };
  monitoringLocationsLayer: FeatureLayer | null;
  nonprofits: Object;
  nonprofitsLayer: GraphicsLayer | null;
  orphanFeatures: {
    status: 'fetching' | 'error' | 'success';
    features: Graphic[];
  };
  permittedDischargers: { status: Status; data: PermittedDischargersData | {} };
  pointsData: { features: Graphic[] } | null;
  pointsLayer: FeatureLayer | null;
  protectedAreasData: ProtectedAreasDataState;
  protectedAreasHighlightLayer: GraphicsLayer | null;
  protectedAreasLayer: MapImageLayer | null;
  providersLayer: GraphicsLayer | null;
  searchIconLayer: GraphicsLayer | null;
  searchText: string;
  selWaterbodyLayer: Object | null;
  showAllPolluted: boolean;
  statesData: StatesDataState;
  summaryLayerMaxRecordCount: number | null;
  upstreamExtent: Viewpoint | null;
  upstreamLayer: (GraphicsLayer & { error?: boolean }) | null;
  upstreamLayerVisible: boolean;
  upstreamWidget: ReactNode | null;
  upstreamWidgetDisabled: boolean;
  usgsStreamgagesLayer: FeatureLayer | null;
  visibleLayers: { [layer: string]: boolean };
  watershed: string;
  waterbodyCountMismatch: boolean | null;
  waterbodyData: { features: Graphic[] } | null;
  waterbodyLayer: GroupLayer | null;
  watershedsLayerMaxRecordCount: number | null;
  wildScenicRiversData: FeaturesDataState;
  wildScenicRiversLayer: FeatureLayer | null;
  wsioHealthIndexData: WsioHealthIndexDataState;
  wsioHealthIndexLayer: FeatureLayer | null;

  // monitoring panel
  monitoringGroups: MonitoringLocationGroups;
  monitoringFeatureUpdates: {
    [locationId: string]: MonitoringFeatureUpdate;
  } | null;

  // identified issues panel
  showDischargers: boolean;
  showPolluted: boolean;
  pollutionParameters: { [parameter: string]: boolean } | null;

  // getters
  getAllFeatures: () => Graphic[] | null;
  getAllWaterbodiesLayer: () => GroupLayer | null;
  getAllWaterbodiesWidgetDisabled: () => boolean;
  getCurrentExtent: () => Viewpoint | null;
  getHuc12: () => string;
  getHucBoundaries: () => FeatureSet | null;
  getMapView: () => MapView | null;
  getUpstreamExtent: () => Viewpoint | null;
  getUpstreamLayer: () => GraphicsLayer | null;
  getUpstreamWidgetDisabled: () => boolean;
  getWatershed: () => string;

  // setters
  resetData: () => void;
  resetMap: (useDefaultZoom: boolean) => void;
  setActionsLayer: (actionsLayer: GraphicsLayer) => void;
  setAddress: (address: string) => void;
  setAllWaterbodiesLayer: (allWaterbodiesLayer: GroupLayer) => void;
  setAllWaterbodiesWidgetDisabled: (
    allWaterbodiesWidgetDisabled: boolean,
  ) => void;
  setAreasData: (areasData: { features: Graphic[] }) => void;
  setAreasLayer: (areasLayer: FeatureLayer) => void;
  setAssessmentUnitId: (assessmentUnitId: string) => void;
  setAssessmentUnitIds: (assessmentUnitIds: string[]) => void;
  setAtHucBoundaries: (atHucBoundaries: boolean) => void;
  setAttainsPlans: (attainsPlans: FetchDataState) => void;
  setBasemap: (basemap: Basemap | string) => void;
  setBoundariesLayer: (boundariesLayer: GraphicsLayer) => void;
  setCipSummary: (cipSummary: {
    status: Status;
    data: Huc12SummaryData | {};
  }) => void;
  setCountyBoundaries: (countyBoundaries: FeatureSet) => void;
  setCurrentExtent: (currentExtent: Viewpoint) => void;
  setDischargersLayer: (dischargersLayer: GraphicsLayer) => void;
  setDrinkingWater: (drinkingWater: {
    status: Status;
    data: DrinkingWaterData[];
  }) => void;
  setDrinkingWaterTabIndex: (drinkingWaterTabIndex: number) => void;
  setErrorMessage: (errorMessage: string) => void;
  setFIPS: (FIPS: {
    status: Status;
    stateCode: string;
    countyCode: string;
  }) => void;
  setFishingInfo: (fishingInfo: FishingInfoState) => void;
  setGrts: (grts: GrtsDataState) => void;
  setHomeWidget: (homeWidget: Home) => void;
  setHuc12: (huc12: string) => void;
  setHucBoundaries: (hucBoundaries: FeatureSet) => void;
  setIssuesLayer: (issuesLayer: GraphicsLayer) => void;
  setLastSearchText: (lastSearchText: string) => void;
  setLayers: (layers: Layer[]) => void;
  setLinesData: (linesData: { features: Graphic[] }) => void;
  setLinesLayer: (linesLayer: FeatureLayer) => void;
  setMapView: (mapView: MapView | null) => void;
  setMonitoringFeatureUpdates: (monitoringFeatureUpdates: {
    [locationId: string]: MonitoringFeatureUpdate;
  }) => void;
  setMonitoringGroups: (monitoringGroups: MonitoringLocationGroups) => void;
  setMonitoringLocations: (monitoringLocations: {
    status: Status;
    data: MonitoringLocationsData;
  }) => void;
  setMonitoringLocationsLayer: (monitoringLocationsLayer: FeatureLayer) => void;
  setNoDataAvailable: () => void;
  setNonprofits: (nonprofits: Object) => void;
  setNonprofitsLayer: (nonprofitsLayer: GraphicsLayer) => void;
  setOrphanFeatures: (orphanFeatures: {
    status: 'fetching' | 'error' | 'success';
    features: Graphic[];
  }) => void;
  setPermittedDischargers: (permittedDischargers: {
    status: Status;
    data: PermittedDischargersData;
  }) => void;
  setPointsData: (pointsData: { features: Graphic[] }) => void;
  setPointsLayer: (pointsLayer: FeatureLayer) => void;
  setPollutionParameters: (pollutionParameters: {
    [parameter: string]: boolean;
  }) => void;
  setProtectedAreasData: (protectedAreasData: ProtectedAreasDataState) => void;
  setProtectedAreasHighlightLayer: (
    protectedAreasHighlightLayer: GraphicsLayer,
  ) => void;
  setProtectedAreasLayer: (protectedAreasLayer: MapImageLayer) => void;
  setProvidersLayer: (providersLayer: GraphicsLayer) => void;
  setSearchIconLayer: (searchIconLayer: GraphicsLayer) => void;
  setSearchText: (searchText: string) => void;
  setSelWaterbodyLayer: (selWaterbodyLayer: Object) => void;
  setShowAllPolluted: (showAllPolluted: boolean) => void;
  setStatesData: (statesData: StatesDataState) => void;
  setSummaryLayerMaxRecordCount: (summaryLayerMaxRecordCount: number) => void;
  setUpstreamExtent: (upstreamExtent: Viewpoint) => void;
  setUpstreamLayer: (
    upstreamLayer: GraphicsLayer & { error?: boolean },
  ) => void;
  setUpstreamLayerVisible: (upstreamLayerVisible: boolean) => void;
  setUpstreamWidget: (upstreamWidget: ReactNode) => void;
  setUpstreamWidgetDisabled: (upstreamWidgetDisabled: boolean) => void;
  setUsgsStreamgagesLayer: (usgsStreamgagesLayer: FeatureLayer) => void;
  setVisibleLayers: (visibleLayers: { [layer: string]: boolean }) => void;
  setWaterbodyCountMismatch: (waterbodyCountMismatch: boolean) => void;
  setWaterbodyData: (waterbodyData: { features: Graphic[] }) => void;
  setWaterbodyLayer: (waterbodyLayer: GroupLayer) => void;
  setWatershed: (watershed: string) => void;
  setWatershedsLayerMaxRecordCount: (
    watershedsLayerMaxRecordCount: number,
  ) => void;
  setWildScenicRiversData: (wildScenicRiversData: FeaturesDataState) => void;
  setWildScenicRiversLayer: (wildScenicRiversLayer: FeatureLayer) => void;
  setWsioHealthIndexData: (
    wsioHealthIndexData: WsioHealthIndexDataState,
  ) => void;
  setWsioHealthIndexLayer: (wsioHealthIndexLayer: FeatureLayer) => void;
};

type Props = {
  children: ReactNode;
};

export class LocationSearchProvider extends Component<Props, State> {
  state: State = {
    initialExtent: new Extent({
      xmin: -15634679.853814237,
      ymin: -3023256.7294788733,
      xmax: -5713765.078627277,
      ymax: 12180985.440778064,
      spatialReference: { wkid: 102100 },
    }),
    currentExtent: null,
    upstreamExtent: null,
    highlightOptions: { color: '#32C5FD', fillOpacity: 1 },
    searchText: '',
    lastSearchText: '',
    huc12: '',
    assessmentUnitIds: [],
    watershed: '',
    address: '',
    fishingInfo: { status: 'fetching', data: [] },
    statesData: { status: 'fetching', data: [] },
    wsioHealthIndexData: { status: 'fetching', data: [] },
    wildScenicRiversData: { status: 'fetching', data: [] },
    protectedAreasData: { status: 'fetching', data: [], fields: [] },
    assessmentUnitId: '',
    monitoringLocations: { status: 'fetching', data: {} },
    permittedDischargers: { status: 'fetching', data: {} },
    grts: { status: 'fetching', data: { items: [] } },
    attainsPlans: { status: 'fetching', data: {} },
    drinkingWater: { status: 'fetching', data: [] },
    cipSummary: { status: 'fetching', data: {} },
    nonprofits: { status: 'fetching', data: [] },
    mapView: null,
    layers: [],
    waterbodyLayer: null,
    issuesLayer: null,
    monitoringLocationsLayer: null,
    usgsStreamgagesLayer: null,
    dischargersLayer: null,
    nonprofitsLayer: null,
    wildScenicRiversLayer: null,
    protectedAreasLayer: null,
    protectedAreasHighlightLayer: null,
    providersLayer: null,
    boundariesLayer: null,
    searchIconLayer: null,
    actionsLayer: null,
    selWaterbodyLayer: null,
    showDischargers: false,
    showPolluted: true,
    wsioHealthIndexLayer: null,
    allWaterbodiesLayer: null,
    homeWidget: null,
    upstreamWidget: null,
    upstreamWidgetDisabled: false,
    allWaterbodiesWidgetDisabled: false,
    visibleLayers: {},
    basemap: 'gray-vector',
    hucBoundaries: null,
    atHucBoundaries: false,
    countyBoundaries: null,
    waterbodyData: null,
    linesData: null,
    areasData: null,
    pointsData: null,
    orphanFeatures: { status: 'fetching', features: [] },
    waterbodyCountMismatch: null,
    FIPS: { status: 'fetching', stateCode: '', countyCode: '' },

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
    setMonitoringLocations: (monitoringLocations: {
      status: Status;
      data: MonitoringLocationsData;
    }) => {
      this.setState({ monitoringLocations });
    },
    setPermittedDischargers: (permittedDischargers: {
      status: Status;
      data: PermittedDischargersData;
    }) => {
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
    setProtectedAreasData: (protectedAreasData) => {
      this.setState({ protectedAreasData });
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
    setCipSummary: (cipSummary: {
      status: Status;
      data: Huc12SummaryData | {};
    }) => {
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
      let features: Graphic[] = [];
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
        orphanFeatures: { status: 'fetching', features: [] },
        waterbodyCountMismatch: null,
        countyBoundaries: null,
        atHucBoundaries: false,
        hucBoundaries: null,
        monitoringGroups: null,
        monitoringFeatureUpdates: null,
        monitoringLocations: { status: 'fetching', data: {} },
        permittedDischargers: { status: 'fetching', data: {} },
        nonprofits: { status: 'fetching', data: [] },
        grts: { status: 'fetching', data: { items: [] } },
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
        orphanFeatures: { status: 'fetching', features: [] },
        waterbodyCountMismatch: null,
        countyBoundaries: null,
        monitoringLocations: { status: 'success', data: {} },
        permittedDischargers: { status: 'success', data: {} },
        nonprofits: { status: 'success', data: [] },
        grts: { status: 'success', data: { items: [] } },
        attainsPlans: { status: 'success', data: {} },
        cipSummary: { status: 'success', data: {} },
        drinkingWater: { status: 'success', data: [] },
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
