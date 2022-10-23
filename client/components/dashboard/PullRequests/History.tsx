import { useMemo } from "react";
import dayjs from "dayjs";
import { PullRequest } from "../../../common/types";
import { getFirstDateInterval } from "../../../common/utils";
import LineChart from "../../common/Charts/Line";

const PullRequestsHistory = ({
  pullRequests,
  filters,
}: {
  pullRequests: PullRequest[];
  filters: Record<string, any>;
}) => {
  const { firstDate, interval } = getFirstDateInterval(filters.time);

  const activePRByDate = useMemo(() => {
    const results: { id: string; data: { x: string; y: number }[] } = {
      id: "Pull requests",
      data: [],
    };
    if (firstDate && interval) {
      let currentDate = dayjs(firstDate).startOf("day");
      const data = [];
      while (currentDate.startOf("day") < dayjs().startOf("day")) {
        const endDate = currentDate.add(1, interval);
        const allPRsDate = pullRequests.filter(
          (c) =>
            dayjs(c.createdAt).isBefore(endDate) &&
            (!c.closedAt ||
              (dayjs(c.closedAt).isBefore(endDate) &&
                dayjs(c.closedAt).isAfter(currentDate)))
        );

        data.push({
          x: `${currentDate.format("YYYY/MM/DD")} to ${endDate.format(
            "YYYY/MM/DD"
          )}`,
          y: allPRsDate.length,
        });
        currentDate = currentDate.add(1, interval);
      }
      results.data = data;
    }
    return [results];
  }, [firstDate, interval, pullRequests]);

  return (
    <div
      className="overflow-x-auto relative shadow-md sm:rounded-lg py-8"
      style={{ height: "500px" }}
    >
      <LineChart data={activePRByDate} />
    </div>
  );
};

export default PullRequestsHistory;
