// @flow

import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs';
import { css } from 'styled-components/macro';
// components
import TabErrorBoundary from 'components/shared/ErrorBoundary/TabErrorBoundary';
import LoadingSpinner from 'components/shared/LoadingSpinner';
import Switch from 'components/shared/Switch';
import ViewOnMapButton from 'components/shared/ViewOnMapButton';
import WaterbodyInfo from 'components/shared/WaterbodyInfo';
import {
  AccordionList,
  AccordionItem,
} from 'components/shared/Accordion/MapHighlight';
import { errorBoxStyles } from 'components/shared/MessageBoxes';
import {
  keyMetricsStyles,
  keyMetricStyles,
  keyMetricNumberStyles,
  keyMetricLabelStyles,
} from 'components/shared/KeyMetrics';
import { tabsStyles } from 'components/shared/ContentTabs';
// contexts
import { LocationSearchContext } from 'contexts/locationSearch';
import { useServicesContext } from 'contexts/LookupFiles';
// utilities
import {
  plotFacilities,
  plotStations,
} from 'components/pages/LocationMap/MapFunctions';
import { useWaterbodyOnMap } from 'utils/hooks';
// data
import { characteristicGroupMappings } from 'config/characteristicGroupMappings';
// errors
import { monitoringError } from 'config/errorMessages';

const containerStyles = css`
  padding: 1em;
`;

const modifiedErrorBoxStyles = css`
  ${errorBoxStyles};
  text-align: center;
`;

const centeredTextStyles = css`
  text-align: center;
`;

const accordionContentStyles = css`
  padding: 0.4375em 0.875em 0.875em;
`;

const tableStyles = css`
  thead {
    background-color: #f0f6f9;
  }

  th:last-of-type,
  td:last-of-type {
    text-align: right;
  }
`;

const toggleStyles = css`
  display: flex;
  align-items: center;

  span {
    margin-left: 0.5rem;
  }
`;

type MonitoringLocationData = {
  type: 'FeatureCollection',
  features: Array<{
    type: 'Feature',
    geometry: Object,
    properties: Object,
  }>,
};

type Station = {
  sampleType: 'Monitoring Station',
  siteId: string,
  orgId: string,
  orgName: string,
  locationLongitude: number,
  locationLatitude: number,
  locationName: string,
  locationType: string,
  locationUrl: string,
  stationProviderName: string,
  stationTotalSamples: number,
  stationTotalMeasurements: number,
  uid: string,
};

type StationGroups = {
  [label: string]: {
    label: string,
    groupName: string,
    stations: Station[],
    toggled: boolean,
  },
};

function Monitoring() {
  const services = useServicesContext();

  // draw the waterbody on the map
  useWaterbodyOnMap();

  const {
    monitoringStations,
    monitoringGroups,
    showAllMonitoring,
    setMonitoringGroups,
    dischargersLayer,
    permittedDischargers,
    monitoringStationsLayer,
    setShowAllMonitoring,
    watershed,
    visibleLayers,
    setVisibleLayers,
  } = React.useContext(LocationSearchContext);

  const [
    prevMonitoringLocationData,
    setPrevMonitoringLocationData,
  ] = React.useState<MonitoringLocationData>({});

  const [
    monitoringLocationToggles,
    setMonitoringLocationToggles,
  ] = React.useState({});

  const [monitoringStationGroups, setMonitoringStationGroups] = React.useState(
    {},
  );

  const [allMonitoringStations, setAllMonitoringStations] = React.useState([]);

  const [
    displayedMonitoringStations,
    setDisplayedMonitoringStations,
  ] = React.useState([]);

  const [allToggled, setAllToggled] = React.useState(true);

  const [sortBy, setSortBy] = React.useState('locationName');

  const storeMonitoringStations = React.useCallback(() => {
    if (!monitoringStations.data.features) {
      setAllMonitoringStations([]);
      return;
    }

    // build up monitoring stations, toggles, and groups
    let allMonitoringStations = [];
    let monitoringLocationToggles = {};
    let monitoringStationGroups: StationGroups = {
      Other: { label: 'Other', stations: [], toggled: true },
    };

    monitoringStations.data.features.forEach((station) => {
      const monitoringStation = {
        sampleType: 'Monitoring Station',
        siteId: station.properties.MonitoringLocationIdentifier,
        orgId: station.properties.OrganizationIdentifier,
        orgName: station.properties.OrganizationFormalName,
        locationLongitude: station.geometry.coordinates[0],
        locationLatitude: station.geometry.coordinates[1],
        locationName: station.properties.MonitoringLocationName,
        locationType: station.properties.MonitoringLocationTypeName,
        // TODO: explore if the built up locationUrl below is ever different from
        // `station.properties.siteUrl`. from a quick test, they seem the same
        locationUrl:
          `${services.data.waterQualityPortal.monitoringLocationDetails}` +
          `${station.properties.ProviderName}/` +
          `${station.properties.OrganizationIdentifier}/` +
          `${station.properties.MonitoringLocationIdentifier}/`,
        // monitoring station specific properties:
        stationProviderName: station.properties.ProviderName,
        stationTotalSamples: station.properties.activityCount,
        stationTotalMeasurements: station.properties.resultCount,
        // create a unique id, so we can check if the monitoring station has
        // already been added to the display (since a monitoring station id
        // isn't universally unique)
        uid:
          `${station.properties.MonitoringLocationIdentifier}/` +
          `${station.properties.ProviderName}/` +
          `${station.properties.OrganizationIdentifier}`,
        characteristicGroupResultCount: JSON.stringify(
          station.properties.characteristicGroupResultCount,
        ),
      };

      allMonitoringStations.push(monitoringStation);

      // build up the monitoringLocationToggles and monitoringStationGroups
      let groupAdded = false;

      characteristicGroupMappings.forEach((mapping) => {
        monitoringLocationToggles[mapping.label] = true;

        for (const group in station.properties.characteristicGroupResultCount) {
          // if characteristic group exists in switch config object
          if (mapping.groupNames.includes(group)) {
            // if switch group (w/ label key) already exists, add the stations to it
            if (monitoringStationGroups[mapping.label]) {
              monitoringStationGroups[mapping.label].stations.push(
                monitoringStation,
              );
              // else, create the group (w/ label key) and add the station
            } else {
              monitoringStationGroups[mapping.label] = {
                label: mapping.label,
                stations: [monitoringStation],
                toggled: true,
              };
            }
            groupAdded = true;
          }
        }
      });

      // if characteristic group didn't exist in switch config object,
      // add the station to the 'Other' group
      if (!groupAdded)
        monitoringStationGroups['Other'].stations.push(monitoringStation);
    });

    if (monitoringGroups) {
      setMonitoringLocationToggles(monitoringGroups);
    } else {
      setMonitoringLocationToggles(monitoringLocationToggles);
    }

    setAllMonitoringStations(allMonitoringStations);
    setDisplayedMonitoringStations(allMonitoringStations);
    setMonitoringStationGroups(monitoringStationGroups);
    setAllToggled(showAllMonitoring);

    if (!monitoringGroups) setMonitoringGroups(monitoringLocationToggles);
  }, [
    services,
    monitoringGroups,
    monitoringStations,
    setMonitoringGroups,
    showAllMonitoring,
  ]);

  const drawMap = React.useCallback(() => {
    if (allMonitoringStations.length === 0) return;
    if (services.status === 'fetching') return;
    const addedStationUids = [];
    let tempDisplayedMonitoringStations = [];

    if (allToggled) {
      tempDisplayedMonitoringStations = allMonitoringStations;
    } else {
      // var use intentional for IE support
      for (var key in monitoringStationGroups) {
        const group = monitoringStationGroups[key];
        // if the location is toggled
        if (monitoringLocationToggles[group.label]) {
          group.stations.forEach((station) => {
            // add the station to the display, if it has not already been added
            if (!addedStationUids.includes(station.uid)) {
              addedStationUids.push(station.uid);
              tempDisplayedMonitoringStations.push(station);
            }
          });
        }
      }
    }

    plotStations(
      tempDisplayedMonitoringStations,
      monitoringStationsLayer,
      services,
    );

    if (tempDisplayedMonitoringStations.length === 0) {
      setDisplayedMonitoringStations([]);
      return;
    }

    if (
      displayedMonitoringStations.length ===
      tempDisplayedMonitoringStations.length
    ) {
      return;
    }

    setDisplayedMonitoringStations(tempDisplayedMonitoringStations);
  }, [
    displayedMonitoringStations,
    allMonitoringStations,
    allToggled,
    monitoringLocationToggles,
    monitoringStationGroups,
    monitoringStationsLayer,
    services,
  ]);

  const toggleSwitch = React.useCallback(
    (groupLabel: string) => {
      const toggleGroups = monitoringLocationToggles;

      if (groupLabel === 'All') {
        if (!allToggled) {
          // toggle everything on
          setAllToggled(true);
          for (var toggle in toggleGroups) {
            toggleGroups[toggle] = true;
          }

          setShowAllMonitoring(true);
          monitoringStationsLayer.visible = true;
        } else {
          // toggle everything off
          setAllToggled(false);
          for (var key in toggleGroups) {
            toggleGroups[key] = false;
          }

          setShowAllMonitoring(false);
          monitoringStationsLayer.visible = false;
        }
      }
      // just one of the categories was changed
      else {
        monitoringStationsLayer.visible = true;
        toggleGroups[groupLabel] = !monitoringLocationToggles[groupLabel];

        // if all other switches are toggled on, toggle the 'All' switch on
        const groups = toggleGroups;
        delete groups['All'];

        const allOthersToggled = Object.keys(groups).every((group) => {
          return groups[group];
        });

        setAllToggled(allOthersToggled);
        setShowAllMonitoring(allOthersToggled);
      }

      setMonitoringGroups(toggleGroups);
      setMonitoringLocationToggles(toggleGroups);

      drawMap();
    },
    [
      monitoringStationsLayer,
      allToggled,
      drawMap,
      monitoringLocationToggles,
      setMonitoringGroups,
      setShowAllMonitoring,
    ],
  );

  // emulate componentdidmount
  const [componentMounted, setComponentMounted] = React.useState(false);
  React.useEffect(() => {
    if (componentMounted) return;
    storeMonitoringStations();
    setComponentMounted(true);
  }, [componentMounted, storeMonitoringStations]);

  // emulate componentdidupdate
  const mounted = React.useRef();
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    } else {
      // re-store monitoring stations if the data changes
      if (monitoringStations.data !== prevMonitoringLocationData) {
        setPrevMonitoringLocationData(monitoringStations.data);
        storeMonitoringStations();
      }

      // return early if displayedMonitoringStations hasn't yet been set
      if (displayedMonitoringStations.length === 0) return;

      drawMap();
    }
  }, [
    monitoringStations,
    prevMonitoringLocationData,
    displayedMonitoringStations,
    drawMap,
    storeMonitoringStations,
  ]);

  // clear the visible layers if the monitoring stations service failed
  React.useEffect(() => {
    if (monitoringStations.status !== 'failure') return;

    if (Object.keys(visibleLayers).length > 0) setVisibleLayers({});
  }, [monitoringStations, visibleLayers, setVisibleLayers]);

  // draw the permitted dischargers on the map
  React.useEffect(() => {
    // wait until permitted dischargers data is set in context
    if (
      permittedDischargers.data['Results'] &&
      permittedDischargers.data['Results']['Facilities']
    ) {
      plotFacilities({
        facilities: permittedDischargers.data['Results']['Facilities'],
        layer: dischargersLayer,
      });
    }
  }, [permittedDischargers.data, dischargersLayer]);

  const sortedMonitoringStations = displayedMonitoringStations
    ? displayedMonitoringStations.sort((a, b) => {
        if (sortBy === 'stationTotalMeasurements') {
          return b.stationTotalMeasurements - a.stationTotalMeasurements;
        }

        if (sortBy === 'siteId') {
          return a.siteId.localeCompare(b.siteId);
        }

        return a[sortBy].localeCompare(b[sortBy]);
      })
    : [];

  const totalLocations = allMonitoringStations.length.toLocaleString();
  const displayLocations = sortedMonitoringStations.length.toLocaleString();

  return (
    <div css={containerStyles}>
      <div css={keyMetricsStyles}>
        <div css={keyMetricStyles}>
          {monitoringStations.status === 'fetching' ? (
            <LoadingSpinner />
          ) : (
            <>
              <span css={keyMetricNumberStyles}>
                {monitoringStations.status === 'failure'
                  ? 'N/A'
                  : `${monitoringStations.data.features.length}`}
              </span>
              <p css={keyMetricLabelStyles}>Sample Locations</p>
            </>
          )}
        </div>
      </div>

      <div css={tabsStyles}>
        <Tabs>
          <TabList>
            <Tab>Monitoring Stations</Tab>
            <Tab>Daily Stream Flow Conditions</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {monitoringStations.status === 'fetching' && <LoadingSpinner />}

              {monitoringStations.status === 'failure' && (
                <div css={modifiedErrorBoxStyles}>
                  <p>{monitoringError}</p>
                </div>
              )}

              {monitoringStations.status === 'success' && (
                <>
                  <p>
                    View available monitoring locations in your local watershed
                    or view by category.
                  </p>

                  {allMonitoringStations.length === 0 && (
                    <p css={centeredTextStyles}>
                      There are no Water Monitoring Locations in the {watershed}{' '}
                      watershed.
                    </p>
                  )}

                  {allMonitoringStations.length > 0 && (
                    <>
                      <table css={tableStyles} className="table">
                        <thead>
                          <tr>
                            <th>
                              <div css={toggleStyles}>
                                <Switch
                                  checked={allToggled}
                                  onChange={(ev) => toggleSwitch('All')}
                                  ariaLabel="Toggle all monitoring locations"
                                />
                                <span>All Monitoring Locations</span>
                              </div>
                            </th>
                            <th>Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.values(monitoringStationGroups)
                            .map((group) => {
                              // remove duplicates caused by a single monitoring station having multiple overlapping groupNames
                              // like 'Inorganics, Major, Metals' and 'Inorganics, Minor, Metals'
                              const uniqueStations = [
                                ...new Set(group.stations),
                              ];

                              return (
                                <tr key={group.label}>
                                  <td>
                                    <div css={toggleStyles}>
                                      <Switch
                                        checked={
                                          monitoringLocationToggles[group.label]
                                        }
                                        onChange={(ev) =>
                                          toggleSwitch(group.label)
                                        }
                                        ariaLabel={`Toggle ${group.label}`}
                                      />
                                      <span>{group.label}</span>
                                    </div>
                                  </td>
                                  <td>
                                    {uniqueStations.length.toLocaleString()}
                                  </td>
                                </tr>
                              );
                            })
                            .sort((a, b) => {
                              // sort the switches with Other at the end
                              if (a.key === 'Other') return 1;
                              if (b.key === 'Other') return -1;
                              return a.key > b.key ? 1 : -1;
                            })}
                        </tbody>
                      </table>

                      <AccordionList
                        expandDisabled={true} // disabled to avoid large number of web service calls
                        title={
                          <>
                            <strong>{displayLocations}</strong> of{' '}
                            <strong>{totalLocations}</strong> Water Monitoring
                            Locations in the <em>{watershed}</em> watershed.
                          </>
                        }
                        onSortChange={({ value }) => setSortBy(value)}
                        sortOptions={[
                          {
                            label: 'Monitoring Location Name',
                            value: 'locationName',
                          },
                          {
                            label: 'Organization ID',
                            value: 'orgId',
                          },
                          {
                            label: 'Monitoring Site ID',
                            value: 'siteId',
                          },
                          {
                            label: 'Monitoring Measurements',
                            value: 'stationTotalMeasurements',
                          },
                        ]}
                      >
                        {sortedMonitoringStations.map((item, index) => {
                          const feature = {
                            geometry: {
                              type: 'point',
                              longitude: item.locationLongitude,
                              latitude: item.locationLatitude,
                            },
                            attributes: item,
                          };

                          return (
                            <AccordionItem
                              key={index}
                              title={
                                <strong>
                                  {item.locationName || 'Unknown'}
                                </strong>
                              }
                              subTitle={
                                <>
                                  <em>Organization ID:</em>&nbsp;&nbsp;
                                  {item.orgId}
                                  <br />
                                  <em>Monitoring Site ID:</em>&nbsp;&nbsp;
                                  {item.siteId.replace(`${item.orgId}-`, '')}
                                  <br />
                                  <em>Monitoring Measurements:</em>&nbsp;&nbsp;
                                  {item.stationTotalMeasurements}
                                </>
                              }
                              feature={feature}
                              idKey="siteId"
                            >
                              <div css={accordionContentStyles}>
                                <WaterbodyInfo
                                  type="Monitoring Station"
                                  feature={feature}
                                  services={services}
                                />
                                <ViewOnMapButton feature={feature} />
                              </div>
                            </AccordionItem>
                          );
                        })}
                      </AccordionList>
                    </>
                  )}
                </>
              )}
            </TabPanel>
            <TabPanel>(Placeholder)</TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </div>
  );
}

export default function MonitoringContainer({ ...props }: Props) {
  return (
    <TabErrorBoundary tabName="Monitoring">
      <Monitoring {...props} />
    </TabErrorBoundary>
  );
}
