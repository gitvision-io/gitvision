import { useMemo } from "react";
import dayjs from "dayjs";
import { ResponsiveBump } from "@nivo/bump";
import { RepositoryStatistics } from "../../../common/types";

const getFirstDateInterval = (
  time: string
): { firstDate: Date; interval: "hour" | "day" | "week" | "month" } => {
  const date = new Date();
  let interval: "hour" | "day" | "week" | "month" = "day";
  switch (time) {
    case "last day":
      date.setHours(date.getHours() - 24);
      interval = "hour";
      break;

    case "last week":
      date.setHours(date.getHours() - 168);
      interval = "day";
      break;

    case "last month":
      date.setMonth(date.getMonth() - 1);
      interval = "week";
      break;

    case "last 3 months":
      date.setMonth(date.getMonth() - 3);
      interval = "week";
      break;

    case "last 6 months":
      date.setMonth(date.getMonth() - 6);
      interval = "month";
      break;
  }
  return { firstDate: date, interval };
};

function groupBy<T extends Record<string, any>>(
  data: T[],
  key: string
): Record<string, T[]> {
  return data.reduce(function (r, a) {
    r[a[key]] = r[a[key]] || [];
    r[a[key]].push(a);
    return r;
  }, Object.create(null));
}

const ContributorsHistory = ({
  repositories,
  filters,
}: {
  repositories: RepositoryStatistics[];
  filters: Record<string, any>;
}) => {
  const commits = repositories.flatMap((r) => r.commits);
  const { firstDate, interval } = getFirstDateInterval(filters.time);
  console.log({ firstDate, interval });

  const commitsByDay = useMemo(() => {
    let results: { id: string; data: { x: string; y: number }[] }[] = [];
    if (firstDate && interval) {
      const authorCommits = groupBy(commits, "author");
      results = Object.keys(authorCommits).map((author) => {
        let currentDate = dayjs(firstDate).startOf("day");
        const data = [];
        while (currentDate < dayjs()) {
          const allCommitsDate = commits.filter((c) => {
            const endInterval = currentDate.add(1, interval);
            return dayjs(c.date).isBefore(endInterval);
          });
          const allAuthorsCommits = groupBy(allCommitsDate, "author");
          const sorted = Object.entries(allAuthorsCommits)
            .map(([a, commits]) => ({ author: a, nbCommits: commits.length }))
            .sort((a, b) => {
              if (a.nbCommits > b.nbCommits) {
                return -1;
              }
              return 1;
            });

          const authorIndex = sorted.findIndex((s) => s.author === author);
          data.push({
            x: currentDate.format("YYYY/MM/DD"),
            y:
              authorIndex > -1
                ? authorIndex + 1
                : Object.keys(authorCommits).length,
          });
          currentDate = currentDate.add(1, interval);
        }
        return {
          id: author,
          data,
        };
      });
    }
    return results;
  }, [firstDate, interval, commits]);

  console.log(commitsByDay);
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg h-96">
      <ResponsiveBump
        data={commitsByDay}
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
      />
    </div>
  );
};

export default ContributorsHistory;
