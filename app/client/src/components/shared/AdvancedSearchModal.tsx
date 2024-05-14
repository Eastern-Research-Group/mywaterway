/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useState } from 'react';
import Select from 'react-select';
// components
import { linkButtonStyles } from 'components/shared/LinkButton';
import LoadingSpinner from 'components/shared/LoadingSpinner';
import Modal from 'components/shared/Modal';
import StatusContent from 'components/shared/StatusContent';
// contexts
import { useServicesContext } from 'contexts/LookupFiles';
// types
import type { FormEvent } from 'react';
import type { FetchState } from 'types';
// utils
import { fetchCheck } from 'utils/fetchUtils';
import { useAbort } from 'utils/hooks';

const PAGE_SIZE = 20;

const locationTypes = [
  { value: 'monitoringLocation', label: 'Monitoring Location' },
  { value: 'assessmentUnit', label: 'Waterbody' },
];

/*
## Styles
*/

const buttonStyles = css`
  margin-bottom: 0;
  font-size: 0.9375em;
  &.active {
    background-color: #0071bc !important;
  }
`;

/*
## Types
*/

type WqpDomainValuesResponse = {
  codes: Array<{ desc: string; providers: string; value: string }>;
  recordCount: number;
};

/*
## Components
*/

type AdvancedSearchModalProps = {
  onSubmit: (search: string, geometry?: __esri.Point) => void;
};

export function AdvancedSearchModal({ onSubmit }: AdvancedSearchModalProps) {
  const services = useServicesContext();
  const { getSignal } = useAbort();

  const [locationType, setLocationType] = useState<
    (typeof locationTypes)[number] | null
  >(null);
  const [monitoringLocationId, setMonitoringLocationId] = useState('');

  const [results, setResults] = useState<FetchState<WqpDomainValuesResponse>>({
    status: 'idle',
    data: null,
  });

  async function executeSearchQuery() {
    if (!locationType) return;

    if (locationType.value === 'monitoringLocation') {
      const url = `${services.data.waterQualityPortal.domainValues}/monitoringlocation?text=${monitoringLocationId}&mimeType=json&pageSize=${PAGE_SIZE}`;
      return await fetchCheck(url, getSignal());
    } else if (locationType.value === 'assessmentUnit') {
    }
  }

  const [searching, setSearching] = useState(false);

  function onSearch(ev: FormEvent) {
    ev.preventDefault();
    setSearching(true);
    setResults({ status: 'pending', data: null });
    executeSearchQuery()
      .then((data) => setResults({ status: 'success', data }))
      .catch(() => setResults({ status: 'failure', data: null }))
      .finally(() => setSearching(false));
  }

  return (
    <Modal
      label="Advanced location search"
      triggerElm={
        <button css={linkButtonStyles} type="button">
          Advanced Search
        </button>
      }
    >
      <StatusContent
        status={services.status}
        failure="Advance search is not available at this time"
      >
        <form onSubmit={onSearch}>
          <label htmlFor="advanced-search-modal_location-type">
            Location Type
          </label>
          <Select
            inputId="advanced-search-modal-location-type"
            isSearchable={false}
            onChange={setLocationType}
            options={locationTypes}
            placeholder="Select location type"
            value={locationType}
          />
          {locationType?.value === 'monitoringLocation' && (
            <>
              <div>
                <label htmlFor="advanced-search-modal_monitoring-location-id">
                  Location Name or Site ID
                </label>
                <input
                  id="advanced-search-modal_monitoring-location-id"
                  onChange={(e) => setMonitoringLocationId(e.target.value)}
                  placeholder="Enter location name or site ID"
                  value={monitoringLocationId}
                />
              </div>
            </>
          )}
          <button css={buttonStyles} disabled={searching} type="submit">
            <i className="fas fa-search" aria-hidden="true" />
            &nbsp;&nbsp;Search
          </button>
        </form>
      </StatusContent>
      <StatusContent
        status={results.status}
        empty="No results found"
        failure="Failed to load results"
      >
        <ResultsList results={results.data as WqpDomainValuesResponse} />
      </StatusContent>
    </Modal>
  );
}

function ResultsList({ results }: { results: WqpDomainValuesResponse }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);

  return (
    <div>
      <h3>Results</h3>
    </div>
  );
}

export default AdvancedSearchModal;
