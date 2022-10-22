import {
  BumpLineTooltip,
  BumpSerie,
  DefaultBumpDatum,
  ResponsiveBump,
} from "@nivo/bump";

const Bump = ({
  data,
  tooltip,
}: {
  data: BumpSerie<DefaultBumpDatum, Record<string, string | { x: string; y: number }[]>>[];
  tooltip?: BumpLineTooltip<
    DefaultBumpDatum,
    Record<string, string | { x: string; y: number }[]>
  >;
}) => (
  <ResponsiveBump
    data={data}
    colors={{ scheme: "spectral" }}
    lineWidth={3}
    activeLineWidth={6}
    inactiveLineWidth={3}
    inactiveOpacity={0.15}
    pointSize={10}
    activePointSize={16}
    inactivePointSize={0}
    pointColor={{ theme: "background" }}
    pointBorderWidth={3}
    activePointBorderWidth={3}
    pointBorderColor={{ from: "serie.color" }}
    axisTop={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "",
      legendPosition: "middle",
      legendOffset: -36,
    }}
    axisBottom={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "",
      legendPosition: "middle",
      legendOffset: 32,
    }}
    axisLeft={{
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "ranking",
      legendPosition: "middle",
      legendOffset: -40,
    }}
    margin={{ top: 40, right: 100, bottom: 40, left: 60 }}
    axisRight={null}
    tooltip={tooltip}
  />
);

export default Bump;
