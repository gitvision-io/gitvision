import { useMemo } from "react";
import dayjs from "dayjs";
import { RepositoryStatistics } from "../../../common/types";
import { getFirstDateInterval } from "../../../common/utils";
import Bump from "../../common/Charts/Bump";

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
            .map(([a, commits]) => ({
              author: a,
              nbCommits: commits.length,
              numberOfLineAdded: commits.reduce(
                (acc, cur) => acc + cur.numberOfLineAdded,
                0
              ),
            }))
            .sort((a, b) =>
              a.numberOfLineAdded > b.numberOfLineAdded ? -1 : 1
            );

          const authorIndex = sorted.findIndex((s) => s.author === author);
          data.push({
            x: currentDate.format("YYYY/MM/DD"),
            y:
              authorIndex > -1
                ? authorIndex + 1
                : Object.keys(authorCommits).length,
            nbLinesAdded: (allAuthorsCommits[author] || []).reduce(
              (acc, cur) => acc + cur.numberOfLineAdded,
              0
            ),
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

  return (
    <div
      className="overflow-x-auto relative shadow-md sm:rounded-lg my-4 py-8"
      style={{ height: "500px" }}
    >
      <Bump
        data={commitsByDay}
        tooltip={(data) => (
          <div className="p-2 bg-blue-50 rounded border border-blue-500">
            Started at{" "}
            {
              (data.serie.data.data[0] as unknown as { nbLinesAdded: number })
                .nbLinesAdded
            }{" "}
            lines added
            <br />
            Ended at{" "}
            {
              (
                data.serie.data.data[
                  data.serie.data.data.length - 1
                ] as unknown as {
                  nbLinesAdded: number;
                }
              ).nbLinesAdded
            }{" "}
            lines added
          </div>
        )}
      />
    </div>
  );
};

export default ContributorsHistory;
