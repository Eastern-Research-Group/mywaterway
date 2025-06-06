/** @jsxImportSource @emotion/react */

import { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { css } from '@emotion/react';
import { WindowSize } from '@reach/window-size';
import StickyBox from 'react-sticky-box';
// components
import Page from 'components/shared/Page';
import NavBar from 'components/shared/NavBar';
import LoadingSpinner from 'components/shared/LoadingSpinner';
import {
  AccordionList,
  AccordionItem,
} from 'components/shared/AccordionMapHighlight';
import ShowLessMore from 'components/shared/ShowLessMore';
import ActionsMap from 'components/shared/ActionsMap';
import { GlossaryTerm } from 'components/shared/GlossaryPanel';
import ViewOnMapButton from 'components/shared/ViewOnMapButton';
import MapVisibilityButton from 'components/shared/MapVisibilityButton';
import VirtualizedList from 'components/shared/VirtualizedList';
import DynamicExitDisclaimer from 'components/shared/DynamicExitDisclaimer';
import WaterbodyDownload from 'components/shared/WaterbodyDownload';
// styled components
import { errorBoxStyles, textBoxStyles } from 'components/shared/MessageBoxes';
import {
  splitLayoutContainerStyles,
  splitLayoutColumnsStyles,
  splitLayoutColumnStyles,
} from 'components/shared/SplitLayout';
import {
  boxStyles,
  boxHeadingStyles,
  boxSectionStyles,
} from 'components/shared/Box';
// contexts
import { useConfigFilesState } from 'contexts/ConfigFiles';
import { LayersProvider } from 'contexts/Layers';
import { LocationSearchContext } from 'contexts/locationSearch';
import { MapHighlightProvider } from 'contexts/MapHighlight';
// utilities
import { fetchCheck } from 'utils/fetchUtils';
import {
  getOrganizationLabel,
  getTypeFromAttributes,
  mapRestorationPlanToGlossary,
} from 'utils/mapFunctions';
import { chunkArrayCharLength, getExtensionFromPath } from 'utils/utils';
// styles
import { colors, noMapDataWarningStyles } from 'styles/index';
// errors
import { actionsError, noActionsAvailableCombo } from 'config/errorMessages';

const echoUrl = 'https://echo.epa.gov/detailed-facility-report?fid=';

function getAssessmentUnitNames(services: any, orgId: string, action: Object) {
  return new Promise((resolve, reject) => {
    const unitIds = action.associatedWaters.specificWaters.map((water) => {
      return water.assessmentUnitIdentifier;
    });

    // unitIds, in 100 item chunks, to not overload attains web service call
    const chunkedUnitIds = chunkArrayCharLength(unitIds, 1000);

    // request data with each chunk of unitIds
    const requests = [];

    chunkedUnitIds.forEach((chunk) => {
      const url =
        `${services.attains.serviceUrl}` +
        `assessmentUnits?organizationId=${orgId}` +
        `&assessmentUnitIdentifier=${chunk}`;
      const request = fetchCheck(url);
      requests.push(request);
    });

    Promise.all(requests)
      .then((responses) => {
        // the attains assessmentUnits web service returns an object with an
        // 'items' array containing a single object. so we’ll create an array
        // constructed from the first (and only) item in the 'items' array of
        // each web service response
        const itemsFromEachResponse = responses.map((res) => res.items[0]);
        // we’ll then combine the array of objects from each response into
        // a single object, concatinating the assessment units data arrays
        // (every other field contains the same data each web service response)
        const data = itemsFromEachResponse.reduce((acc, cur) => {
          return {
            ...acc,
            assessmentUnits: acc.assessmentUnits.concat(cur.assessmentUnits),
          };
        });

        // pass combined data from all responses to be processed
        resolve(data);
      })
      .catch((err) => reject(err));
  });
}

function processAssessmentUnitData(data: Object, action: Object) {
  if (data) {
    const { assessmentUnits } = data;

    // create a temporary names object for mapping assessment unit ids and names
    const names = {};
    assessmentUnits.forEach((unit) => {
      names[unit.assessmentUnitIdentifier] = unit.assessmentUnitName;
    });

    // update each specific waters’ name from the mapping names object
    action.associatedWaters.specificWaters.forEach((water) => {
      water.assessmentUnitName = names[water.assessmentUnitIdentifier];
    });
  }

  // pass updated action and the org id to be displayed
  return action;
}

function getPollutantsWaters(action: Object, orgId: string) {
  // build up pollutants, and waters from action data
  const pollutants = [];
  const waters = [];

  action.associatedWaters.specificWaters.forEach((water) => {
    const {
      assessmentUnitIdentifier,
      assessmentUnitName,
      associatedPollutants,
      parameters,
    } = water;

    // build up unique list of pollutants
    associatedPollutants.forEach((pollutant) => {
      if (pollutants.indexOf(pollutant.pollutantName) === -1) {
        pollutants.push(pollutant.pollutantName);
      }
    });

    waters.push({
      assessmentUnitIdentifier,
      assessmentUnitName,
      associatedPollutants,
      parameters,
    });
  });

  const sortedWaters = waters.toSorted((a, b) => {
    if (a.assessmentUnitName && b.assessmentUnitName) {
      return a.assessmentUnitName.localeCompare(b.assessmentUnitName);
    } else if (!a.assessmentUnitName && b.assessmentUnitName) {
      return 1;
    } else {
      return -1;
    }
  });

  return {
    sortedPollutants: pollutants.toSorted((a, b) => a.localeCompare(b)),
    sortedWaters,
  };
}

function getWaterbodyGraphic(
  mapLayer: Object,
  orgId: string,
  assessmentUnitIdentifier: string,
) {
  const graphics = mapLayer.status === 'success' && mapLayer.layer?.graphics;
  if (!graphics) return null;

  const assessmentIndex = graphics.items.findIndex((graphic) => {
    const graphicOrgId = graphic.attributes.organizationid;
    const graphicAuId = graphic.attributes.assessmentunitidentifier;

    return graphicOrgId === orgId && graphicAuId === assessmentUnitIdentifier;
  });

  return assessmentIndex === -1 ? null : graphics.items[assessmentIndex];
}

const modifiedErrorBoxStyles = css`
  ${errorBoxStyles}
  margin: 1rem;
  text-align: center;
`;

const modifiedTextBoxStyles = css`
  ${textBoxStyles}
  margin: 1em 0;
  padding: 0.75em;
`;

const inlineBoxStyles = css`
  ${boxSectionStyles};
  padding-top: 0;

  * {
    display: inline-block;
  }
`;

const modifiedBoxSectionStyles = css`
  ${boxSectionStyles}

  hr {
    margin-top: 0;
  }
`;

const introTextStyles = css`
  margin-top: 0 !important;
  padding-bottom: 0.4375em !important;
`;

const iconStyles = css`
  margin-right: 5px;
`;

const listStyles = css`
  padding-bottom: 0;
`;

const accordionContentStyles = css`
  padding: 0.4375em 0.875em 0.875em;

  li {
    margin-bottom: 0.875em;
  }

  p {
    margin-top: 0.875em;
  }

  button {
    margin-bottom: 0.25em;
  }
`;

const paragraphContentStyles = css`
  button {
    &:hover,
    &:focus {
      background-color: ${colors.navyBlue()};
    }
  }
`;

const disclaimerStyles = css`
  display: inline-block;
`;

const textBottomMarginStyles = css`
  margin-bottom: 0.5em !important;
`;

const strongBottomMarginStyles = css`
  display: block;
  margin-bottom: 0.25em !important;
`;

function Actions() {
  const configFiles = useConfigFilesState();
  const { orgId, actionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [noActions, setNoActions] = useState(false);
  const [error, setError] = useState(false);
  const [mapLayer, setMapLayer] = useState({
    status: 'fetching',
    layer: null,
  });

  // fetch action data from the attains 'actions' web service
  const [organizationName, setOrganizationName] = useState('');
  const [actionName, setActionName] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [actionTypeCode, setActionTypeCode] = useState('');
  const [actionStatusCode, setActionStatusCode] = useState('');
  const [documents, setDocuments] = useState([]);
  const [pollutants, setPollutants] = useState([]);
  const [waters, setWaters] = useState([]);
  useEffect(() => {
    const url =
      configFiles.data.services.attains.serviceUrl +
      `actions?ActionIdentifier=${actionId}` +
      `&organizationIdentifier=${orgId}`;

    function onError(err) {
      setLoading(false);
      setError(true);
      console.error(err);
    }

    fetchCheck(url)
      .then((res) => {
        if (res.items.length < 1) {
          setLoading(false);
          setNoActions(true);
          return;
        }

        setOrganizationName(res.items[0].organizationName);
        if (res.items.length >= 1 && res.items[0].actions.length >= 1) {
          const action = res.items[0].actions[0];

          getAssessmentUnitNames(configFiles.data.services, orgId, action)
            .then((data) => {
              // process assessment unit data and get key action data
              const {
                actionName,
                completionDate,
                actionTypeCode,
                actionStatusCode,
                documents,
              } = processAssessmentUnitData(data, action);

              // Get a sorted list of pollutants and waters
              const { sortedPollutants, sortedWaters } = getPollutantsWaters(
                action,
                orgId,
              );

              // set the state variables
              setLoading(false);
              setActionName(actionName);
              setCompletionDate(completionDate);
              setActionTypeCode(actionTypeCode);
              setActionStatusCode(actionStatusCode);
              setDocuments(
                documents.sort((a, b) =>
                  a.documentName.localeCompare(b.documentName),
                ),
              );
              setPollutants(sortedPollutants);
              setWaters(sortedWaters);
            })
            .catch(onError);
        }
      })
      .catch(onError);
  }, [actionId, configFiles, orgId]);

  // Builds the unitIds dictionary that is used for determining what
  // waters to display on the screen and what the content will be.
  const [unitIds, setUnitIds] = useState({});
  useEffect(() => {
    if (waters.length === 0) return;

    const unitIds = {};

    waters.forEach((water) => {
      const { assessmentUnitIdentifier, associatedPollutants, parameters } =
        water;

      const content = (reportingCycle, hasWaterbody) => {
        const assessmentUrl =
          reportingCycle && hasWaterbody
            ? `/waterbody-report/${orgId}/${assessmentUnitIdentifier}/${reportingCycle}`
            : `/waterbody-report/${orgId}/${assessmentUnitIdentifier}`;

        const hasTmdlData =
          actionTypeCode === 'TMDL' && associatedPollutants.length > 0;

        return (
          <>
            {organizationName && orgId && (
              <p css={textBottomMarginStyles}>
                <strong>Organization Name (ID):&nbsp;</strong>
                {organizationName} ({orgId})
              </p>
            )}
            {hasTmdlData && associatedPollutants.length > 0 && (
              <>
                <strong css={strongBottomMarginStyles}>
                  Associated Impairments:{' '}
                </strong>
                <ul css={listStyles}>
                  {associatedPollutants
                    .sort((a, b) =>
                      a.pollutantName.localeCompare(b.pollutantName),
                    )
                    .map((pollutant) => {
                      const permits = pollutant.permits
                        .filter((permit) => {
                          return permit.NPDESIdentifier;
                        })
                        .sort((a, b) => {
                          return a.NPDESIdentifier.localeCompare(
                            b.NPDESIdentifier,
                          );
                        });

                      return (
                        <li key={pollutant.pollutantName}>
                          <strong>{pollutant.pollutantName}</strong>
                          <br />
                          <em>TMDL End Point: </em>
                          <ShowLessMore
                            text={pollutant.TMDLEndPointText}
                            charLimit={150}
                          />
                          <br />
                          {permits.length > 0 && (
                            <em>Links below open in a new browser tab.</em>
                          )}
                          <br />
                          <em>Permits: </em>

                          {permits.length === 0 ? (
                            <>Not specified.</>
                          ) : (
                            permits.map((permit, index) => (
                              <Fragment key={permit.NPDESIdentifier}>
                                <a
                                  href={echoUrl + permit.NPDESIdentifier}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {permit.NPDESIdentifier}
                                </a>
                                {index === permits.length - 1 ? '' : ', '}
                              </Fragment>
                            ))
                          )}
                        </li>
                      );
                    })}
                </ul>
              </>
            )}
            {!hasTmdlData && parameters.length > 0 && (
              <>
                <strong css={strongBottomMarginStyles}>
                  Parameters Addressed:{' '}
                </strong>
                <ul css={listStyles}>
                  {parameters
                    .sort((a, b) =>
                      a.parameterName.localeCompare(b.parameterName),
                    )
                    .map((parameter) => {
                      return (
                        <li key={parameter.parameterName}>
                          <strong>{parameter.parameterName}</strong>
                        </li>
                      );
                    })}
                </ul>
              </>
            )}

            {assessmentUrl && (
              <div css={modifiedTextBoxStyles}>
                <a
                  href={assessmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i
                    css={iconStyles}
                    className="fas fa-file-alt"
                    aria-hidden="true"
                  />
                  View Waterbody Report
                </a>
                &nbsp;&nbsp;
                <small css={disclaimerStyles}>(opens new browser tab)</small>
              </div>
            )}
          </>
        );
      };

      unitIds[assessmentUnitIdentifier] = content;
    });

    setUnitIds(unitIds);
  }, [waters, actionTypeCode, orgId, organizationName]);

  // calculate height of div holding actions info
  const [infoHeight, setInfoHeight] = useState(0);
  const measuredRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!measuredRef?.current) return;
    setInfoHeight(measuredRef.current.getBoundingClientRect().height);
  }, [measuredRef.current]);

  const infoBox = (
    <div css={boxStyles} ref={measuredRef}>
      <h3 css={boxHeadingStyles}>
        Plan Information <br />
        <small>
          <strong>ID:</strong> {actionId}
        </small>
      </h3>

      <div css={boxSectionStyles}>
        <p css={introTextStyles}>
          This page reflects information provided to EPA by the state on plans
          in place to restore water quality. These plans could include a{' '}
          <GlossaryTerm term="TMDL">TMDL</GlossaryTerm> and/or a watershed
          restoration plan.
        </p>
      </div>

      <div css={inlineBoxStyles}>
        <h4>Name:&nbsp;</h4>
        <p>{actionName}</p>
      </div>

      <div css={inlineBoxStyles}>
        <h4>Completed:&nbsp;</h4>
        <p>{completionDate}</p>
      </div>

      <div css={inlineBoxStyles}>
        <h4>Type:&nbsp;</h4>
        <p>{mapRestorationPlanToGlossary(actionTypeCode, true)}</p>
      </div>

      <div css={inlineBoxStyles}>
        <h4>Status:&nbsp;</h4>
        <p>
          {/* if Action type is not a TMDL, change 'EPA Final Action' to 'Final */}
          {actionTypeCode !== 'TMDL' && actionStatusCode === 'EPA Final Action'
            ? 'Final'
            : actionStatusCode}
        </p>
      </div>

      <div css={inlineBoxStyles}>
        <h4>Organization Name (ID):&nbsp;</h4>
        <p>
          {organizationName} ({orgId})
        </p>
      </div>

      {configFiles.status === 'success' && (
        <div css={modifiedBoxSectionStyles}>
          <hr />
          <WaterbodyDownload
            configFiles={configFiles.data}
            descriptor="Download Plan Data"
            fileBaseName={`Restoration_Plan-${actionId}`}
            filters={{
              actionId,
            }}
            profile={actionTypeCode === 'TMDL' ? 'tmdl' : 'actions'}
          />
        </div>
      )}
    </div>
  );

  const [expandedRows, setExpandedRows] = useState([]);
  if (loading) {
    return (
      <Page>
        <NavBar title="Plan Summary" />
        <LoadingSpinner />
      </Page>
    );
  }

  if (noActions) {
    return (
      <Page>
        <NavBar title="Plan Summary" />

        <div css={splitLayoutContainerStyles}>
          <div css={modifiedErrorBoxStyles}>
            <p>{noActionsAvailableCombo(orgId, actionId)}</p>
          </div>
        </div>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <NavBar title="Plan Summary" />

        <div css={splitLayoutContainerStyles}>
          <div css={modifiedErrorBoxStyles}>
            <p>{actionsError}</p>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <NavBar title="Plan Summary" />

      <div css={splitLayoutContainerStyles} data-content="container">
        <WindowSize>
          {({ width, height }) => {
            return (
              <div css={splitLayoutColumnsStyles}>
                <div css={splitLayoutColumnStyles}>
                  {width < 960 ? (
                    <>
                      {infoBox}
                      <MapVisibilityButton>
                        {(mapShown) => (
                          <div
                            style={{
                              display: mapShown ? 'block' : 'none',
                              height: height - 40,
                            }}
                          >
                            <ActionsMap
                              layout="narrow"
                              unitIds={unitIds}
                              onLoad={setMapLayer}
                            />
                          </div>
                        )}
                      </MapVisibilityButton>
                    </>
                  ) : (
                    <StickyBox offsetTop={20} offsetBottom={20}>
                      {infoBox}
                      <div
                        id="plan-summary-map"
                        style={{
                          height: height - infoHeight - 70,
                          minHeight: '400px',
                        }}
                      >
                        <ActionsMap
                          layout="wide"
                          unitIds={unitIds}
                          onLoad={setMapLayer}
                        />
                      </div>
                    </StickyBox>
                  )}
                </div>

                <div css={splitLayoutColumnStyles}>
                  <div css={boxStyles}>
                    <h3 css={boxHeadingStyles}>Associated Documents</h3>
                    {documents.length > 0 && (
                      <div css={[boxSectionStyles, { paddingBottom: 0 }]}>
                        <p css={introTextStyles}>
                          <em>Links below open in a new browser tab.</em>
                        </p>
                      </div>
                    )}
                    <div css={boxSectionStyles}>
                      <ul css={listStyles}>
                        {documents.length === 0 && (
                          <li>No documents are available</li>
                        )}

                        {documents.length > 0 &&
                          documents.map((document) => {
                            const extension = getExtensionFromPath(
                              document.documentFileName,
                              document.documentURL,
                            );

                            return (
                              <li key={document.documentName}>
                                <a
                                  href={document.documentURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  data-hmw-extension={extension}
                                >
                                  {document.documentName}
                                </a>
                                <DynamicExitDisclaimer
                                  url={document.documentURL}
                                />
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  </div>

                  {actionTypeCode === 'TMDL' && (
                    <div css={boxStyles}>
                      <h3 css={boxHeadingStyles}>Impairments Addressed</h3>

                      <div css={boxSectionStyles}>
                        <ul css={listStyles}>
                          {pollutants.length === 0 && (
                            <li>No impairments are addressed</li>
                          )}

                          {pollutants.length > 0 &&
                            pollutants.map((pollutant) => (
                              <li key={pollutant}>{pollutant}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div css={boxStyles}>
                    <h3 css={boxHeadingStyles}>Waters Covered</h3>

                    <div css={boxSectionStyles}>
                      {waters.length > 0 && (
                        <AccordionList
                          expandDisabled={true} // disabled to avoid large number of web service calls
                        >
                          <VirtualizedList
                            items={waters}
                            renderer={({ index }) => {
                              const water = waters[index];

                              const auId = water.assessmentUnitIdentifier;
                              const name = water.assessmentUnitName;

                              const graphic = getWaterbodyGraphic(
                                mapLayer,
                                orgId,
                                auId,
                              );

                              // get the type of symbol for creating a unique key, since it is currently
                              // possible for the assessmentunitid and objectid to be duplicated across
                              // layers.
                              const symbolType = graphic
                                ? getTypeFromAttributes(graphic)
                                : '';

                              const waterbodyReportingCycle = graphic
                                ? graphic.attributes.reportingcycle
                                : null;

                              const orgLabel = getOrganizationLabel(
                                graphic?.attributes,
                              );

                              return (
                                <AccordionItem
                                  key={symbolType + orgId + auId}
                                  title={
                                    <strong>
                                      {name || 'Name not provided'}
                                    </strong>
                                  }
                                  subTitle={
                                    <>
                                      {orgLabel} {auId}{' '}
                                      {mapLayer.status === 'success' &&
                                        !graphic && (
                                          <>
                                            <br />
                                            <span css={noMapDataWarningStyles}>
                                              <i className="fas fa-exclamation-triangle" />
                                              <strong>
                                                [Waterbody not visible on map.]
                                              </strong>
                                            </span>
                                          </>
                                        )}
                                    </>
                                  }
                                  feature={graphic}
                                  idKey="assessmentunitidentifier"
                                  allExpanded={expandedRows.includes(index)}
                                  onChange={() => {
                                    // add the item to the expandedRows array so the accordion item
                                    // will stay expanded when the user scrolls or highlights map items
                                    if (expandedRows.includes(index)) {
                                      setExpandedRows(
                                        expandedRows.filter(
                                          (item) => item !== index,
                                        ),
                                      );
                                    } else
                                      setExpandedRows(
                                        expandedRows.concat(index),
                                      );
                                  }}
                                >
                                  <div css={accordionContentStyles}>
                                    {unitIds[auId] &&
                                      unitIds[auId](
                                        waterbodyReportingCycle,
                                        graphic ? true : false,
                                      )}

                                    <p css={paragraphContentStyles}>
                                      {mapLayer.status === 'success' && (
                                        <ViewOnMapButton
                                          feature={{
                                            attributes: {
                                              assessmentunitidentifier: auId,
                                              organizationid: orgId,
                                              fieldName: 'hmw-extra-content',
                                            },
                                          }}
                                          layers={[mapLayer.layer]}
                                          fieldName="hmw-extra-content"
                                          disabled={graphic ? false : true}
                                        />
                                      )}
                                    </p>
                                  </div>
                                </AccordionItem>
                              );
                            }}
                          />
                        </AccordionList>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        </WindowSize>
      </div>
    </Page>
  );
}

export default function ActionsContainer() {
  const { resetData } = useContext(LocationSearchContext);
  useEffect(() => {
    return function cleanup() {
      resetData(true);
    };
  }, [resetData]);

  return (
    <LayersProvider>
      <MapHighlightProvider>
        <Actions />
      </MapHighlightProvider>
    </LayersProvider>
  );
}
