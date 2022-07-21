import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Point from '@arcgis/core/geometry/Point';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Query from '@arcgis/core/rest/support/Query';
import QueryTask from '@arcgis/core/tasks/QueryTask';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
// contexts
import { useFetchedDataDispatch } from 'contexts/FetchedData';
import { useFullscreenContext } from 'contexts/Fullscreen';
import { useMapHighlightContext } from 'contexts/MapHighlight';
import { useLocationSearchContext } from 'contexts/locationSearch';
import { useServicesContext } from 'contexts/LookupFiles';
// config
import { monitoringClusterSettings } from 'components/shared/LocationMap';
import {
  getPopupContent,
  getPopupTitle,
  graphicComparison,
} from 'utils/mapFunctions';
// utilities
import { useDynamicPopup } from 'utils/hooks';
import { parseAttributes } from 'utils/utils';
// types
import type { MonitoringFeatureUpdate, MonitoringFeatureUpdates } from 'types';

// --- types ---
interface ClickEvent {
  button: number;
  buttons: 0 | 1 | 2;
  mapPoint: Point;
  native: PointerEvent;
  stopPropagation: Function;
  type: 'click';
  timestamp: number;
  x: number;
  y: number;
}

interface PointerMoveEvent {
  button: number;
  buttons: number;
  eventId: number;
  native: PointerEvent;
  pointerId: number;
  pointerType: 'mouse' | 'touch';
  stopPropagation: Function;
  timestamp: number;
  type: 'pointer-move';
  x: number;
  y: number;
}

interface SubLayer extends __esri.Layer {
  parent: __esri.Layer;
}

// --- helpers ---
async function getClusterExtent(
  cluster: __esri.Graphic,
  mapView: __esri.MapView,
  layer: FeatureLayer,
) {
  const layerView = await mapView.whenLayerView(layer);
  const query = layerView.createQuery();
  query.aggregateIds = [cluster.getObjectId()];
  await reactiveUtils.whenOnce(() => !layerView.updating);
  const { extent } = await layerView.queryExtent(query);
  return extent;
}

function isPolygon(geometry: __esri.Geometry): geometry is __esri.Polygon {
  return (geometry as __esri.Polygon).type === 'polygon';
}

function updateAttributes(
  graphic: __esri.Graphic,
  updates: MonitoringFeatureUpdates,
): __esri.Graphic | null {
  const graphicId = graphic?.attributes?.uniqueId;
  if (updates?.[graphicId]) {
    const stationUpdates = updates?.[graphicId];
    Object.keys(stationUpdates).forEach((attribute) => {
      graphic.setAttribute(
        attribute,
        stationUpdates[attribute as keyof MonitoringFeatureUpdate],
      );
    });
    return graphic;
  }
  return null;
}

// --- components ---
type Props = {
  // map and view props auto passed from parent Map component by react-arcgis
  map: any;
  view: any;
};

function MapMouseEvents({ view }: Props) {
  const navigate = useNavigate();
  const fetchedDataDispatch = useFetchedDataDispatch();

  const services = useServicesContext();
  const { setHighlightedGraphic, setSelectedGraphic } =
    useMapHighlightContext();

  const {
    getHucBoundaries,
    monitoringFeatureUpdates,
    monitoringLocations,
    monitoringLocationsLayer,
    resetData,
    protectedAreasLayer,
  } = useLocationSearchContext();

  const { fullscreenActive } = useFullscreenContext();

  const getDynamicPopup = useDynamicPopup();

  const handleMapClick = useCallback(
    (event, view) => {
      // get the point location of the user's click
      const point = new Point({
        x: event.mapPoint.longitude,
        y: event.mapPoint.latitude,
        spatialReference: SpatialReference.WGS84,
      });
      const location = webMercatorUtils.geographicToWebMercator(point) as Point;

      // perform a hittest on the click location
      view
        .hitTest(event)
        .then((res: __esri.HitTestResult) => {
          // get and update the selected graphic
          const graphic = getGraphicFromResponse(res);

          if (graphic && graphic.attributes) {
            // if upstream watershed is clicked:
            // set the view highlight options to 0 fill opacity
            if (graphic.layer.id === 'upstreamWatershed') {
              view.highlightOptions.fillOpacity = 0;
            } else {
              view.highlightOptions.fillOpacity = 1;
            }

            if (
              monitoringLocationsLayer &&
              graphic.layer.id === 'monitoringLocationsLayer' &&
              graphic.isAggregate
            ) {
              // zoom in towards the cluster
              getClusterExtent(graphic, view, monitoringLocationsLayer).then(
                (extent) => {
                  if (graphic.attributes.cluster_count <= 20) {
                    // Initial value is null, but DefinitelyTyped FeatureLayer type
                    // doesn't allow to be set as null after construction
                    // @ts-ignore
                    monitoringLocationsLayer.featureReduction = null;
                  }
                  view.goTo(extent);
                },
              );
            } else {
              setSelectedGraphic(graphic);
            }
          } else {
            setSelectedGraphic(null);
          }

          // get the currently selected huc boundaries, if applicable
          const hucBoundaries = getHucBoundaries();
          // only look for huc boundaries if no graphics were clicked and the
          // user clicked outside of the selected huc boundaries
          if (
            !graphic &&
            (!hucBoundaries ||
              hucBoundaries.features.length === 0 ||
              (isPolygon(hucBoundaries.features[0].geometry) &&
                !hucBoundaries.features[0].geometry.contains(location)))
          ) {
            //get the huc boundaries of where the user clicked
            const query = new Query({
              returnGeometry: true,
              geometry: location,
              outFields: ['*'],
            });

            new QueryTask({ url: services.data.wbd })
              .execute(query)
              .then((boundaries) => {
                if (boundaries.features.length === 0) return;

                // Opens the change location popup
                function openChangeLocationPopup() {
                  const { attributes } = boundaries.features[0];
                  view.popup.close();
                  view.popup.open({
                    title: 'Change to this location?',
                    content: getPopupContent({
                      navigate,
                      resetData: () => {
                        fetchedDataDispatch({ type: 'RESET_FETCHED_DATA' });
                        resetData();
                      },
                      feature: {
                        attributes: {
                          changelocationpopup: 'changelocationpopup',
                        },
                        view: view,
                      },
                      getClickedHuc: Promise.resolve({
                        status: 'success',
                        data: {
                          huc12: attributes.huc12,
                          watershed: attributes.name,
                        },
                      }),
                    }),
                  });
                }

                // if the protectedAreasLayer is not visible just open the popup
                // like normal, otherwise query the protectedAreasLayer to see
                // if the user clicked on a protected area
                if (!protectedAreasLayer?.visible) {
                  openChangeLocationPopup();
                } else {
                  // check if protected areas layer was clicked on
                  const queryPadUs = new Query({
                    returnGeometry: false,
                    geometry: location,
                    outFields: ['*'],
                  });
                  new QueryTask({
                    url: `${services.data.protectedAreasDatabase}0`,
                  })
                    .execute(queryPadUs)
                    .then((padRes) => {
                      if (padRes.features.length === 0) {
                        // user did not click on a protected area, open the popup
                        openChangeLocationPopup();
                      } else {
                        // do nothing, so the protected area popup opens
                      }
                    })
                    .catch((err) => console.error(err));
                }
              })
              .catch((err) => console.error(err));
          }
        })
        .catch((err: string) => console.error(err));
    },
    [
      fetchedDataDispatch,
      getHucBoundaries,
      monitoringLocationsLayer,
      navigate,
      setSelectedGraphic,
      services,
      protectedAreasLayer,
      resetData,
    ],
  );

  // Sets up the map mouse events when the component initializes
  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (initialized || services.status === 'fetching') return;

    // These global scoped variables are used to prevent flickering that is caused
    // by the hitTest async events occurring out of order. The global scoped variables
    // are needed because the esri hit test event won't be able to read react state
    // variables.
    var lastFeature: __esri.Graphic | null = null;
    var lastEventId = -1;

    const handleMapMouseOver = (
      event: PointerMoveEvent,
      view: __esri.MapView,
    ) => {
      view
        .hitTest(event)
        .then((res) => {
          // only use the latest event id to perform the highligh
          if (event.eventId < lastEventId) return;
          lastEventId = event.eventId;

          // get the graphic from the hittest
          const extraLayersToIgnore = ['allWaterbodiesLayer'];
          let feature = getGraphicFromResponse(res, extraLayersToIgnore);

          // if any feature besides the upstream watershed is moused over:
          // set the view's highlight fill opacity back to 1
          if (
            feature?.layer?.id !== 'upstreamWatershed' &&
            view.highlightOptions.fillOpacity !== 1 &&
            !view.popup.visible // if popup is not visible then the upstream layer isn't currently selected
          ) {
            view.highlightOptions.fillOpacity = 1;
          }

          // ensure the graphic actually changed prior to setting the context variable
          const equal = graphicComparison(feature, lastFeature);
          if (!equal) {
            setHighlightedGraphic(feature);
            lastFeature = feature;
          }
        })
        .catch((err) => console.error(err));
    };

    // setup the mouse click and mouse over events
    view.on('click', (event: ClickEvent) => {
      handleMapClick(event, view);
    });

    view.on('pointer-move', (event: PointerMoveEvent) => {
      handleMapMouseOver(event, view);
    });

    view.popup.watch('selectedFeature', (graphic: __esri.Graphic) => {
      // set the view highlight options to 0 fill opacity if upstream watershed is selected
      if (graphic?.layer?.id === 'upstreamWatershed') {
        view.highlightOptions.fillOpacity = 0;
      } else {
        view.highlightOptions.fillOpacity = 1;
      }
    });

    // auto expands the popup when it is first opened
    view.popup.watch('visible', (_graphic: __esri.Graphic) => {
      if (view.popup.visible) view.popup.collapsed = false;
    });

    setInitialized(true);
  }, [
    getDynamicPopup,
    handleMapClick,
    initialized,
    services,
    setHighlightedGraphic,
    view,
  ]);

  // reference to a dictionary of date-filtered updates
  // applicable to graphics visible on the map
  const updates = useRef<null | MonitoringFeatureUpdates>(null);
  useEffect(() => {
    if (view?.popup.visible) view.popup.close();
    updates.current = monitoringFeatureUpdates;
  }, [monitoringFeatureUpdates, view.popup]);

  const updateSingleFeature = useCallback(
    (graphic) => {
      view.popup.clear();
      updateAttributes(graphic, updates.current);
      const structuredProps = ['stationTotalsByGroup', 'timeframe'];
      graphic.attributes = parseAttributes(structuredProps, graphic.attributes);
      view.popup.open({
        title: getPopupTitle(graphic.attributes),
        content: getPopupContent({
          feature: graphic,
          services,
          navigate,
        }),
        location: graphic.geometry,
      });
    },
    [navigate, services, view.popup],
  );

  const updateGraphics = useCallback(
    (graphics: __esri.Graphic[]) => {
      if (!updates?.current) return;
      graphics.forEach((graphic) => {
        if (
          graphic.layer?.id === 'monitoringLocationsLayer' &&
          !graphic.isAggregate
        ) {
          if (graphics.length === 1) {
            updateSingleFeature(graphic);
          } else {
            updateAttributes(graphic, updates.current);
          }
        }
      });
    },
    [updateSingleFeature],
  );

  // watches for popups, and updates them if
  // they represent monitoring location features
  const [popupWatchHandler, setPopupWatchHandler] =
    useState<__esri.WatchHandle | null>(null);
  useEffect(() => {
    return function cleanup() {
      popupWatchHandler?.remove();
    };
  }, [popupWatchHandler]);

  useEffect(() => {
    if (services.status === 'fetching') return;
    const handler = view.popup.watch(
      'features',
      (graphics: __esri.Graphic[]) => {
        updateGraphics(graphics);
      },
    );
    setPopupWatchHandler(handler);
    return function cleanup() {
      setPopupWatchHandler(null);
    };
  }, [services.status, updateGraphics, view]);

  // recalculates stored total location count on change of location
  const [locationCount, setLocationCount] = useState<number | null>(null);
  useEffect(() => {
    if (
      monitoringLocations.status !== 'success' ||
      !monitoringLocations.data.features
    )
      return;
    setLocationCount(monitoringLocations.data.features.length);
    return function cleanup() {
      setLocationCount(null);
    };
  }, [monitoringLocations]);

  // restores cluster settings on change of
  // location or on entering/exiting fullscreen
  useEffect(() => {
    if (!locationCount || locationCount <= 20) return;
    if (!monitoringLocationsLayer || monitoringLocationsLayer.featureReduction)
      return;
    // @ts-ignore
    monitoringLocationsLayer.featureReduction = monitoringClusterSettings;
  }, [fullscreenActive, locationCount, monitoringLocationsLayer]);

  // sets a watcher on the zoom level, and restores
  // cluster settings if the user zooms out
  const [zoomWatchHandler, setZoomWatchHandler] =
    useState<__esri.WatchHandle | null>(null);
  useEffect(() => {
    return function cleanup() {
      zoomWatchHandler?.remove();
    };
  }, [zoomWatchHandler]);

  useEffect(() => {
    if (!locationCount || locationCount <= 20) return;
    if (!view || !monitoringLocationsLayer) return;
    const handler = view.watch('zoom', (newZoom: number, oldZoom: number) => {
      if (
        !monitoringLocationsLayer ||
        monitoringLocationsLayer.featureReduction
      )
        return;
      if (newZoom < oldZoom) {
        // @ts-ignore
        monitoringLocationsLayer.featureReduction = monitoringClusterSettings;
      }
    });
    setZoomWatchHandler(handler);
    return function cleanup() {
      setZoomWatchHandler(null);
    };
  }, [locationCount, monitoringLocationsLayer, view]);

  function getGraphicFromResponse(
    res: __esri.HitTestResult,
    additionalLayers: Array<string> = [],
  ) {
    if (!res.results || res.results.length === 0) return null;

    const match = res.results.filter((result) => {
      const { attributes: attr } = result.graphic;
      const layer = result.graphic.layer as SubLayer;
      // ignore huc 12 boundaries, map-marker, highlight and provider graphics
      const excludedLayers = [
        'stateBoundariesLayer',
        'mappedWaterLayer',
        'watershedsLayer',
        'boundaries',
        'map-marker',
        'highlight',
        'providers',
        ...additionalLayers,
      ];
      if (!layer?.id) return null;
      if (attr.name && excludedLayers.indexOf(attr.name) !== -1) return null;
      if (excludedLayers.indexOf(layer.id) !== -1) return null;
      if (excludedLayers.indexOf(layer.parent.id) !== -1) return null;

      // filter out graphics on basemap layers
      if (result.graphic.layer.type === 'vector-tile') return null;

      return result;
    });

    return match[0] ? match[0].graphic : null;
  }

  return null;
}

export default MapMouseEvents;