/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
// components
import LoadingSpinner from 'components/shared/LoadingSpinner';
// styles
import { errorBoxStyles, infoBoxStyles } from 'components/shared/MessageBoxes';
// types
import type { SerializedStyles } from '@emotion/react';
import type { ReactNode } from 'react';
import type { FetchStatus } from 'types';

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

type StatusContentProps = {
  children: ReactNode;
  empty?: string | ReactNode;
  idle?: string | null;
  failure?: string;
  status: FetchStatus;
};

export function StatusContent({
  children,
  empty = 'No data available',
  idle = null,
  failure = 'Failed to load data',
  status,
}: StatusContentProps) {
  switch (status) {
    case 'fetching':
    case 'pending':
      return <LoadingSpinner />;
    case 'empty':
      return typeof empty === 'string' ? (
        <p css={messageBoxStyles(infoBoxStyles)}>{empty}</p>
      ) : (
        empty
      );
    case 'failure':
      return <p css={messageBoxStyles(errorBoxStyles)}>{failure}</p>;
    case 'success':
      return children;
    default:
      return idle && <p css={messageBoxStyles(infoBoxStyles)}>{idle}</p>;
  }
}

export default StatusContent;
