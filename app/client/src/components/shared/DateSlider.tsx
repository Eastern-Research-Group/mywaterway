import { useEffect, useState } from 'react';
import { css } from 'styled-components/macro';
import { useRanger } from 'react-ranger';

/*
 ** Styles
 */
const handleStyles = {
  backgroundColor: '#fff',
  border: '2px solid #0b89f4',
  borderRadius: '100%',
  cursor: 'grab',
  height: '0.9em',
  opacity: '0.8',
  width: '0.9em',
};

const handleStylesActive = {
  ...handleStyles,
  boxShadow: '0 0 0 5px #96dbfa',
  cursor: 'grabbing',
};

const segmentStyles = {
  backgroundColor: '#e9e9e9',
  borderRadius: '6px',
  height: '100%',
};

const segmentStylesActive = {
  ...segmentStyles,
  backgroundColor: '#0b89f4',
};

const sliderContainerStyles = css`
  align-items: flex-end;
  display: flex;
  gap: 1em;
  justify-content: center;
  width: 100%;
`;

const sliderStyles = css`
  align-items: end;
  display: inline-flex;
  height: 3.5em;
  width: 100%;
  z-index: 0;
`;

const tooltipStyles = css`
  background-color: #d5e6ee;
  border-radius: 10%;
  color: #444;
  font-size: 0.8em;
  min-height: auto;
  padding: 0.3em;
  position: absolute;
  transform: translate(-0.85em, -2.65em);
`;

const trackStyles = {
  display: 'inline-block',
  height: '0.25em',
  width: '100%',
  margin: '0.5em 0',
};

type Props = {
  disabled?: boolean;
  min: number;
  max: number;
  onChange: (newValues: number[]) => void;
};

function DateSlider({ disabled = false, min, max, onChange }: Props) {
  const [minYear, setMinYear] = useState(0);
  const [maxYear, setMaxYear] = useState(100);
  const [range, setRange] = useState([minYear, maxYear]);
  useEffect(() => {
    if (!min || !max) return;
    setRange([min, max]);
    setMinYear(min);
    setMaxYear(max);
  }, [min, max]);

  const { getTrackProps, segments, handles } = useRanger({
    min: minYear,
    max: maxYear,
    stepSize: 1,
    values: range,
    onChange,
    onDrag: (newValues: number[]) => setRange(newValues),
  });

  return (
    <div css={sliderContainerStyles}>
      <span>{!disabled && minYear}</span>
      <div css={sliderStyles}>
        <div {...getTrackProps({ style: trackStyles })}>
          {segments.map(({ getSegmentProps }, i) => (
            <div
              {...getSegmentProps({
                key: i,
                style:
                  !disabled && i === 1 ? segmentStylesActive : segmentStyles,
              })}
            />
          ))}
          {!disabled &&
            handles.map(({ value, active, getHandleProps }, i) => (
              <div
                {...getHandleProps({
                  key: i,
                  style: active ? handleStylesActive : handleStyles,
                })}
              >
                <div css={tooltipStyles}>{value}</div>
              </div>
            ))}
        </div>
      </div>
      <span>{!disabled && maxYear}</span>
    </div>
  );
}

export default DateSlider;
