// @flow

import React from 'react';
import { css } from 'styled-components/macro';
// components
import TabErrorBoundary from 'components/shared/ErrorBoundary/TabErrorBoundary';
import AssessmentSummary from 'components/shared/AssessmentSummary';
import WaterbodyList from 'components/shared/WaterbodyList';
import DisclaimerModal from 'components/shared/DisclaimerModal';
import ShowLessMore from 'components/shared/ShowLessMore';
// contexts
import { CommunityTabsContext } from 'contexts/CommunityTabs';
import { LocationSearchContext } from 'contexts/locationSearch';
// utilities
import { useWaterbodyFeatures, useWaterbodyOnMap } from 'utils/hooks';

const containerStyles = css`
  padding: 1em;
`;

const textStyles = css`
  position: relative;
  top: -1em;
  margin-bottom: 1em;
`;

const paragraphStyles = css`
  margin-top: 0;
  padding-bottom: 0;
  line-height: 1.25;
`;

// given a state code like AL and an array of state objects from attains states service,
// returns the full name of the state
function convertStateCode(stateCode: string, stateData: Array<Object>) {
  if (stateData.length === 0) return stateCode;
  const matchingState = stateData.filter((s) => s.code === stateCode)[0];
  return matchingState ? matchingState.name : stateCode;
}

// grammatically correct way of separating list items
// used to prepend commas/and before a list item
function addSerialComma(index: number, arrayLength: number) {
  // first item in list
  if (index === 0) return '';
  // not the first or last item in list
  if (index !== 0 && index !== arrayLength - 1) return ', ';
  // last item in list
  if (index === arrayLength - 1) return ' and ';
}

function EatingFish() {
  const { infoToggleChecked } = React.useContext(CommunityTabsContext);

  const { watershed, fishingInfo, statesData } = React.useContext(
    LocationSearchContext,
  );

  const waterbodies = useWaterbodyFeatures();

  useWaterbodyOnMap('fishconsumption_use');

  return (
    <div css={containerStyles}>
      {infoToggleChecked && (
        <div css={textStyles}>
          <p css={paragraphStyles}>
            Eating fish and shellfish caught in impaired waters can pose health
            risks. For the {watershed} watershed, be sure to look for posted
            fish advisories or consult your local or state environmental health
            department for{' '}
            {fishingInfo.status === 'success' ? (
              <>
                {fishingInfo.data.map((state, index, array) => (
                  <React.Fragment key={index}>
                    {addSerialComma(index, array.length)}
                    <a
                      href={state.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {convertStateCode(state.stateCode, statesData.data)}
                    </a>
                  </React.Fragment>
                ))}
                .{' '}
                <a
                  className="exit-disclaimer"
                  href="https://www.epa.gov/home/exit-epa"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  EXIT
                </a>
              </>
            ) : (
              <>your state.</>
            )}
            <ShowLessMore
              charLimit={0}
              text={`
                  The information in How’s My Waterway about the safety of eating
                  fish caught recreationally should only be considered as general
                  reference. Please consult with your state for local or state-wide
                  fish advisories.
              `}
            />
          </p>

          <DisclaimerModal>
            <p>
              Users of this application should not rely on information relating
              to environmental laws and regulations posted on this application.
              Application users are solely responsible for ensuring that they
              are in compliance with all relevant environmental laws and
              regulations. In addition, EPA cannot attest to the accuracy of
              data provided by organizations outside of the federal government.
            </p>
          </DisclaimerModal>
        </div>
      )}

      <AssessmentSummary
        waterbodies={waterbodies}
        fieldName="fishconsumption_use"
        usageName="fish and shellfish consumption"
      />

      <WaterbodyList
        waterbodies={waterbodies}
        fieldName="fishconsumption_use"
        title={`Waterbodies assessed for fish and shellfish consumption in the ${watershed} watershed.`}
      />
    </div>
  );
}

export default function EatingFishContainer({ ...props }: Props) {
  return (
    <TabErrorBoundary tabName="Eating Fish">
      <EatingFish {...props} />
    </TabErrorBoundary>
  );
}
