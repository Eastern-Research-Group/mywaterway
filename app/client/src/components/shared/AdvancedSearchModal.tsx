/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useRef, useState } from 'react';
import Select from 'react-select';
import { Virtuoso } from 'react-virtuoso';
import { v4 as uuid } from 'uuid';
// components
import { linkButtonStyles } from 'components/shared/LinkButton';
import Modal from 'components/shared/Modal';
import StatusContent from 'components/shared/StatusContent';
// contexts
import { useServicesContext } from 'contexts/LookupFiles';
// styles
import { errorBoxStyles } from 'components/shared/MessageBoxes';
import { fonts } from 'styles';
// types
import type { SerializedStyles } from '@emotion/react';
import type { FormEvent } from 'react';
import type { FetchStatus } from 'types';
// utils
import { fetchCheck } from 'utils/fetchUtils';
import { useAbort } from 'utils/hooks';

const PAGE_SIZE = 100;

enum LocationType {
  MonitoringLocation = 'monitoringLocation',
  AssessmentUnit = 'assessmentUnit',
}

const locationTypes = [
  { value: LocationType.MonitoringLocation, label: 'Monitoring Location' },
  { value: LocationType.AssessmentUnit, label: 'Assessment Unit' },
];

function getColumns(type: LocationType) {
  if (type === LocationType.MonitoringLocation) {
    return ['Site ID', 'Name'];
  } else {
    return [];
  }
}

/*
## Styles
*/

const buttonStyles = css`
  margin-bottom: 0;
  font-size: 0.9375em;
  width: fit-content;

  &.active {
    background-color: #0071bc !important;
  }
`;

const containerStyles = css`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const footerStyles = css`
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 2rem;
  width: 100%;
`;

const formStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 200px;
`;

const gridStyles = (numCols: number) => css`
  display: grid;
  grid-template-columns: repeat(${numCols}, 1fr);

  div {
    display: flex;
    align-items: center;
    padding: 8px 12px;
  }

  div:last-of-type {
    text-align: right;
    justify-content: flex-end;
  }
`;

const gridHeaderStyles = (numCols: number) => css`
  ${gridStyles(numCols)}

  border-bottom: 2px solid #dee2e6;
  font-weight: bold;
`;

const inputStyles = css`
  margin-bottom: 0.75em;
  width: 100%;
  @media (min-width: 768px) {
    width: calc(50% - 0.75em);
  }
`;

const inputsStyles = css`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;

  input[type='text'] {
    border: 1px solid #ced4da;
    border-radius: 4px;
    min-height: 38px;
    padding: 2px 8px;
    width: 100%;
  }
`;

const labelStyles = css`
  margin-bottom: 0.25rem;
  font-family: ${fonts.primary};
  font-size: 0.875rem;
  font-weight: bold;
`;

const messageBoxStyles = (baseStyles: SerializedStyles) => {
  return css`
    ${baseStyles};
    text-align: center;
    margin: 1rem auto;
    padding: 0.7rem 1rem !important;
    max-width: max-content;
    width: 90%;
  `;
};

const resultListStyles = css`
  height: 300px;
`;

const resultRowStyles = (numCols: number) => css`
  ${tableButtonStyles}
  ${gridStyles(numCols)}
  width: 100%;
`;

const tableButtonStyles = css`
  background: none;
  background-color: transparent;
  border: none;
  color: inherit;
  font-weight: normal;
  margin: 0;
  outline: inherit;
  padding: 0;

  &:not(:disabled):focus {
    background-color: #e2f1fb;
    color: inherit;
  }

  &:not(:disabled):hover {
    background-color: #f3f3f3;
    color: inherit;
  }
`;

const resultsContainerStyles = css`
  margin-top: 1rem;
`;

const triggerStyles = css`
  ${linkButtonStyles}

  margin-top: 0.5rem;
`;

/*
## Components
*/

export function AdvancedSearchModal({ onSubmit }: AdvancedSearchModalProps) {
  const services = useServicesContext();
  const { getSignal } = useAbort();

  const [locationType, setLocationType] = useState<
    (typeof locationTypes)[number] | null
  >(null);
  const [modalId, setModalId] = useState(uuid());
  const [monitoringLocationId, setMonitoringLocationId] = useState('');
  const [search, setSearch] = useState<{
    url: string;
    type: LocationType;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clear error message when any interaction occurs.
  const [prevLocationType, setPrevLocationType] = useState<
    (typeof locationTypes)[number] | null
  >(locationType);
  const [prevMonitoringLocationId, setPrevMonitoringLocationId] =
    useState(monitoringLocationId);
  const [prevSearch, setPrevSearch] = useState(search);
  if (
    prevLocationType !== locationType ||
    prevMonitoringLocationId !== monitoringLocationId ||
    prevSearch !== search
  ) {
    setPrevLocationType(locationType);
    setPrevMonitoringLocationId(monitoringLocationId);
    setPrevSearch(search);
    setError(null);
  }

  const onSearch = (ev: FormEvent) => {
    ev.preventDefault();
    if (locationType?.value === LocationType.MonitoringLocation) {
      setSearch({
        url: `${services.data.waterQualityPortal.domainValues}/monitoringlocation?text=${monitoringLocationId}&mimeType=json&pagesize=${PAGE_SIZE}`,
        type: locationType.value,
      });
    } else {
      setSearch(null);
    }
  };

  const getItemLocation = async (id: string, type: string) => {
    if (type === LocationType.MonitoringLocation) {
      const url =
        `${services.data.waterQualityPortal.stationSearch}` +
        `mimeType=geojson&zip=no&siteid=${id}`;
      const res: WqpStationSearchResponse = await fetchCheck(url, getSignal());
      const item = res.features[0];
      if (!item) return Promise.resolve(null);
      return {
        longitude: item.geometry.coordinates[0],
        latitude: item.geometry.coordinates[1],
      } as __esri.Point;
    }
    return Promise.resolve(null);
  };

  const onSelect = async (id: string, type: string) => {
    try {
      const location = await getItemLocation(id, type);
      if (location) {
        onSubmit(id, location);
        reset();
      }
    } catch (err) {
      setError('Failed to load location data');
    }
  };

  const reset = () => {
    setError(null);
    setLocationType(null);
    setModalId(uuid());
    setMonitoringLocationId('');
    setSearch(null);
  };

  return (
    <Modal
      key={modalId}
      label="Advanced location search"
      maxWidth="75vw"
      onClose={reset}
      triggerElm={
        <button css={triggerStyles} type="button">
          Advanced Search
        </button>
      }
    >
      <StatusContent
        status={services.status}
        failure="Advance search is not available at this time"
      >
        <form css={formStyles} onSubmit={onSearch}>
          <div css={inputStyles}>
            <label
              css={labelStyles}
              htmlFor="advanced-search-modal_location-type"
            >
              Location Type:
            </label>
            <Select
              inputId="advanced-search-modal_location-type"
              isSearchable={false}
              onChange={setLocationType}
              options={locationTypes}
              placeholder="Select location type"
              value={locationType}
            />
          </div>
          <div css={inputsStyles}>
            {locationType?.value === LocationType.MonitoringLocation && (
              <>
                <div css={inputStyles}>
                  <label
                    css={labelStyles}
                    htmlFor="advanced-search-modal_monitoring-location-id"
                  >
                    Location Name or Site ID:
                  </label>
                  <input
                    id="advanced-search-modal_monitoring-location-id"
                    onChange={(e) => setMonitoringLocationId(e.target.value)}
                    placeholder="Enter location name or site ID"
                    type="text"
                    value={monitoringLocationId}
                  />
                </div>
              </>
            )}
          </div>
          <div css={containerStyles}>
            <button
              css={buttonStyles}
              disabled={locationType === null}
              type="submit"
            >
              <i className="fas fa-search" aria-hidden="true" />
              &nbsp;&nbsp;Search
            </button>
          </div>
        </form>
        {error && <p css={messageBoxStyles(errorBoxStyles)}>{error}</p>}
        {search && (
          <SearchResults
            key={JSON.stringify(search)}
            onSelect={onSelect}
            search={search}
          />
        )}
      </StatusContent>
    </Modal>
  );
}

function Footer({ context }: ComponentProps) {
  if (!context) return null;

  const { hasMore, loadMore, status } = context;

  return (
    <div css={footerStyles}>
      <StatusContent status={status} failure="Failed to load more results">
        <button disabled={!hasMore} onClick={loadMore}>
          Load more
        </button>
      </StatusContent>
    </div>
  );
}

function SearchResults({
  onSelect,
  search: { type, url },
}: SearchResultsProps) {
  const { getSignal } = useAbort();

  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [results, setResults] = useState<Array<ResultItem>>([]);

  const load = (page: number) => {
    setStatus('pending');
    if (type === LocationType.MonitoringLocation) {
      // WQP pagination is 1-indexed.
      fetchCheck(`${url}&pagenumber=${page + 1}`, getSignal())
        .then((data: WqpDomainValuesResponse) => {
          setCurrentPage(page);
          setNumPages(Math.ceil(data.recordCount / PAGE_SIZE));
          setStatus('success');
          setResults(
            results.concat(
              data.codes.map((code) => ({ id: code.value, label: code.desc })),
            ),
          );
        })
        .catch(() => setStatus('failure'));
    } else {
      setStatus('idle');
    }
  };

  const loadMore = () => {
    load(currentPage + 1);
  };

  const firstResultsLoaded = useRef(false);
  if (!firstResultsLoaded.current) {
    firstResultsLoaded.current = true;
    load(0);
  }

  const columns = getColumns(type);

  return (
    <div css={resultsContainerStyles}>
      <h3 css={labelStyles}>Results:</h3>
      <div css={gridHeaderStyles(columns.length)}>
        {columns.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>
      <div css={resultListStyles}>
        <Virtuoso
          components={{ Footer }}
          context={{
            columns: getColumns(type),
            hasMore: currentPage + 1 < numPages,
            loadMore,
            status,
          }}
          data={results}
          itemContent={(_index, item) => (
            <button
              css={resultRowStyles(getColumns(type).length)}
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id, type)}
            >
              <div>{item.id}</div>
              <div>{item.label}</div>
            </button>
          )}
        />
      </div>
    </div>
  );
}

/*
## Types
*/

type AdvancedSearchModalProps = {
  onSubmit: (search: string, geometry?: __esri.Point) => void;
};

type ComponentProps = {
  context?: {
    hasMore: boolean;
    loadMore: () => void;
    status: FetchStatus;
  };
};

type ResultItem = {
  id: string;
  label: string;
};

type SearchResultsProps = {
  onSelect: (item: string, type: string) => void;
  search: {
    type: LocationType;
    url: string;
  };
};

type WqpDomainValuesResponse = {
  codes: Array<{ desc: string; providers: string; value: string }>;
  recordCount: number;
};

type WqpStationSearchResponse = {
  features: Array<{
    geometry: { coordinates: [number, number]; type: 'Point' };
  }>;
};

export default AdvancedSearchModal;
