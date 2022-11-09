import { useMemo } from "react";
import dayjs from "dayjs";
import { RepositoryStatistics } from "../../../common/types";
import { getFirstDateInterval } from "../../../common/utils";
import LineChart from "../../common/Charts/Line";

const ActiveRepositoriesHistory = ({
  repositories,
  filters,
}: {
  repositories: RepositoryStatistics[];
  filters: Record<string, any>;
}) => {
  const commits = repositories.flatMap((r) => r.commits);
  const { firstDate, interval } = getFirstDateInterval(filters.time);

  const activeReposByDate = useMemo(() => {
    const results: { id: string; data: { x: string; y: number }[] } = {
      id: "Active repositories",
      data: [],
    };
    if (firstDate && interval) {
      let currentDate = dayjs(firstDate).startOf("day");
      const data = [];
      while (currentDate.startOf("day") < dayjs().startOf("day")) {
        const endDate = currentDate.add(1, interval);
        const allCommitsDate = commits.filter(
          (c) =>
            dayjs(c.date).isBefore(endDate) &&
            dayjs(c.date).isAfter(currentDate)
        );

        data.push({
          x: `${currentDate.format("YYYY/MM/DD")} to ${endDate.format(
            "YYYY/MM/DD"
          )}`,
          y: allCommitsDate
            .map((c) => c.repoId)
            .filter((v, i, a) => a.indexOf(v) === i).length,
        });
        currentDate = currentDate.add(1, interval);
      }
      results.data = data;
    }
    return [results];
  }, [firstDate, interval, commits]);

  return (
    <div
      className="overflow-x-auto relative shadow-md sm:rounded-lg py-8"
      style={{ height: "500px" }}
    >
      <LineChart data={activeReposByDate} />
    </div>
  );
};

export default ActiveRepositoriesHistory;
