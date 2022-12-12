import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsAccessibility from 'highcharts/modules/accessibility';
import { useMemo } from 'react';
// styles
import { fonts } from 'styles/index.js';
// types
import type { Options } from 'highcharts';

// add accessibility features to highcharts
highchartsAccessibility(Highcharts);

type Props = {
  categories: string[];
  series: Array<{
    color?: string;
    data: number[];
    name: string;
    type: 'column';
  }>;
  subtitle?: string;
  title?: string;
  xLabel?: string | null;
  yLabel?: string | null;
  yMin?: number;
};

export default function StackedBarChart({
  categories,
  series,
  subtitle,
  title,
  xLabel = null,
  yLabel = null,
  yMin = 0,
}: Props) {
  const options = useMemo<Options>(() => {
    return {
      chart: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        style: { fontFamily: fonts.primary },
        type: 'column',
      },
      credits: { enabled: false },
      legend: {
        verticalAlign: 'top',
      },
      plotOptions: {
        column: {
          stacking: 'normal',
        },
      },
      series,
      subtitle: {
        text: subtitle,
      },
      title: {
        text: title,
      },
      tooltip: {
        formatter: function () {
          return (
            this.points?.reduce((s, point) => {
              return (
                s +
                `<tr>
                <td style="color:${point.series.color};fontWeight:bold">
                  ${point.series.name}: 
                </td>
                <td>${point.y?.toLocaleString()}</td>
              </tr>`
              );
            }, `<b>${this.x}</b><table>`) + '</table>'
          );
        },
        shared: true,
        useHTML: true,
      },
      xAxis: {
        categories,
        title: {
          text: xLabel,
        },
      },
      yAxis: {
        min: yMin,
        title: {
          text: yLabel,
        },
      },
    };
  }, [categories, series, subtitle, title, xLabel, yLabel, yMin]);

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}
