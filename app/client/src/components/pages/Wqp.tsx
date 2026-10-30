/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
//components
import Page from 'components/shared/Page';
import NavBar from 'components/shared/NavBar';
import LoadingSpinner from 'components/shared/LoadingSpinner';
import ReactTable from 'components/shared/ReactTable';
// styled components
import { errorBoxStyles } from 'components/shared/MessageBoxes';
// contexts
import { useConfigFilesState } from 'contexts/ConfigFiles';
// types
import { FetchStatus } from 'types';
// utilities
import { fetchParseCsv } from 'utils/fetchUtils';

type CharacteristicDomainResults = Array<{
  Name: string;
  'Group Name': string;
}>;

function Wqp() {
  const configFiles = useConfigFilesState();

  const [status, setStatus] = useState<FetchStatus>('idle');
  const [wqxData, setWqxData] = useState<CharacteristicDomainResults>([]);

  useEffect(() => {
    if (status != 'idle') return;

    setStatus('pending');
    fetchParseCsv<CharacteristicDomainResults>(
      configFiles.data.services.waterQualityPortal.characteristicDomainValues,
    )
      .then((res) => {
        setWqxData(res);
        setStatus('success');
      })
      .catch((err) => {
        console.error(err);
        setStatus('failure');
      });
  }, []);

  const hmwByWqx: Record<string, string> = {};
  configFiles.data.characteristicGroupMappings.forEach((mapping) => {
    mapping.groupNames.forEach((groupName) => {
      hmwByWqx[groupName] = mapping.label;
    });
  });

  const data = wqxData.map((datum) => ({
    characteristic: datum['Name'],
    wqxGroup: datum['Group Name'],
    hmwGroup: hmwByWqx[datum['Group Name']],
  }));

  return (
    <Page>
      <NavBar title="Water Quality Portal Information" />
    </Page>
  );
}

export default Wqp;
