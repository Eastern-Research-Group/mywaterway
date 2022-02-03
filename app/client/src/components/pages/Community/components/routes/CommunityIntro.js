// @flow

import React, { useContext, useEffect } from 'react';
import { css } from 'styled-components/macro';
// components
import type { RouteProps } from 'routes.js';
// contexts
import { LocationSearchContext } from 'contexts/locationSearch';
// styles
import { fonts } from 'styles/index.js';
// images
import overviewIcon from 'components/pages/Community/images/overview.png';
import drinkingWaterIcon from 'components/pages/Community/images/drinking-water.png';
import swimmingIcon from 'components/pages/Community/images/swimming.png';
import eatingFishIcon from 'components/pages/Community/images/eating-fish.png';
import aquaticLifeIcon from 'components/pages/Community/images/aquatic-life.png';
import monitoringIcon from 'components/pages/Community/images/monitoring.png';
import identifiedIssuesIcon from 'components/pages/Community/images/identified-issues.png';
import restoreIcon from 'components/pages/Community/images/restore.png';
import protectIcon from 'components/pages/Community/images/protect.png';

const containerStyles = css`
  padding: 1.25em;
`;

const headingStyles = css`
  margin-top: 0.25em;
  margin-bottom: 0;
  font-family: ${fonts.primary};
  font-size: 1.25em;
  text-align: center;

  @media (min-width: 560px) {
    font-size: 1.75em;
  }

  @media (min-width: 960px) {
    font-size: 2em;
  }
`;

const topicStyles = css`
  display: flex;
  align-items: center;
  padding: 0.625em 0;
`;

const iconStyles = css`
  padding-right: 0.75em;

  img {
    max-width: 2.75em;
    max-height: 2.75em;
  }
`;

const textStyles = css`
  flex: 1;
`;

type Props = {
  ...RouteProps,
};

// --- components ---
function CommunityIntro({ ...props }: Props) {
  const { setVisibleLayers } = useContext(LocationSearchContext);

  // clear the community page layers when a user navigates to the community intro page
  useEffect(() => {
    setVisibleLayers({});
  }, [setVisibleLayers]);

  return (
    <div css={containerStyles}>
      <h2 css={headingStyles}>Explore Your Water</h2>

      <p>
        Enter a location in the search box to explore waters in your area and
        find out information about the following:
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={overviewIcon} alt="Overview" />
        </span>

        <span css={textStyles}>
          <strong>Overview</strong>
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={swimmingIcon} alt="Swimming" />
        </span>

        <span css={textStyles}>
          <strong>Swimming:</strong> &nbsp; EPA, states, and tribes monitor and
          assess water quality to keep you safe while swimming, wading, or
          boating.
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={eatingFishIcon} alt="Eating Fish" />
        </span>
        <span css={textStyles}>
          <strong>Eating Fish:</strong> &nbsp; EPA, states, and tribes monitor
          and assess water quality to determine if fish and shellfish are safe
          to eat.
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={aquaticLifeIcon} alt="Aquatic Life" />
        </span>

        <span css={textStyles}>
          <strong>Aquatic Life:</strong> &nbsp; EPA, states, and tribes monitor
          and assess water quality to determine the impact of impairments on
          plants and animals living in the water.
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={drinkingWaterIcon} alt="Drinking Water" />
        </span>

        <span css={textStyles}>
          <strong>Drinking Water:</strong> &nbsp; Who provides drinking water in
          your community?
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={monitoringIcon} alt="Monitoring" />
        </span>

        <span css={textStyles}>
          <strong>Monitoring:</strong> &nbsp; View monitoring locations.
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={identifiedIssuesIcon} alt="Identified Issues" />
        </span>

        <span css={textStyles}>
          <strong>Identified Issues:</strong> &nbsp; View identified water
          quality issues.
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={restoreIcon} alt="Restore" />
        </span>

        <span css={textStyles}>
          <strong>Restore:</strong> &nbsp; View EPA funded nonpoint source
          pollution grants and waterbody restoration plans.
        </span>
      </p>

      <p css={topicStyles}>
        <span css={iconStyles}>
          <img src={protectIcon} alt="Protect" />
        </span>

        <span css={textStyles}>
          <strong>Protect:</strong> &nbsp; How can you help?
        </span>
      </p>
    </div>
  );
}

export default CommunityIntro;
