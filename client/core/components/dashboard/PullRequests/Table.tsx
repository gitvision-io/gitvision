import { useEffect, useState } from "react";
import { PullRequest, RepositoryStatistics } from "../../../common/types";

interface GroupedPullRequest {
  state: string;
  count: number;
  lastCreatedAtRepo: string;
  lastCreatedAtDate: string;
  lastClosedAtRepo: string;
  lastClosedAtDate: string;
}

const PullRequestsTable = ({
  pullRequests,
  repositories,
}: {
  pullRequests: PullRequest[];
  repositories: RepositoryStatistics[];
}) => {
  const [groupedPullRequests, setGroupedPullRequests] = useState<
    GroupedPullRequest[]
  >([]);

  const groupByPullrequestsState = () => {
    const groupedPullRequests: GroupedPullRequest[] = [];
    pullRequests.reduce(
      (res: Record<string, GroupedPullRequest>, pullRequest: PullRequest) => {
        if (!res[pullRequest.state]) {
          res[pullRequest.state] = {
            state: pullRequest.state,
            count: 0,
            lastClosedAtDate: pullRequest.closedAt,
            lastClosedAtRepo: pullRequest.repoId,
            lastCreatedAtDate: pullRequest.createdAt,
            lastCreatedAtRepo: pullRequest.repoId,
          } as GroupedPullRequest;
          groupedPullRequests.push(res[pullRequest.state]);
        }
        res[pullRequest.state].count += 1;
        if (
          pullRequest.closedAt &&
          Date.parse(res[pullRequest.state].lastClosedAtDate) <
            Date.parse(pullRequest.closedAt)
        ) {
          res[pullRequest.state].lastClosedAtDate = pullRequest.closedAt;
          res[pullRequest.state].lastClosedAtRepo = pullRequest.repoId;
        }
        if (res[pullRequest.state].lastCreatedAtDate < pullRequest.createdAt) {
          res[pullRequest.state].lastCreatedAtDate = pullRequest.createdAt;
          res[pullRequest.state].lastCreatedAtRepo = pullRequest.repoId;
        }
        return res;
      },
      {} as Record<string, GroupedPullRequest>
    );
    return groupedPullRequests;
  };

  useEffect(() => {
    setGroupedPullRequests(groupByPullrequestsState());
  }, []);
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
          Pull requests
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              State
            </th>
            <th scope="col" className="py-3 px-6">
              Count
            </th>
            <th scope="col" className="py-3 px-6">
              Last created at date
            </th>
            <th scope="col" className="py-3 px-6">
              Last created at repository
            </th>
            <th scope="col" className="py-3 px-6">
              Last closed at date
            </th>
            <th scope="col" className="py-3 px-6">
              Last closed at repository
            </th>
          </tr>
        </thead>
        <tbody>
          {groupedPullRequests?.map((item) => {
            const lastClosedrepo = repositories.find(
              (r) => r.id === item.lastClosedAtRepo
            );
            const lastCreatedrepo = repositories.find(
              (r) => r.id === item.lastCreatedAtRepo
            );
            return (
              <tr
                key={item.state}
                className="bg-white border-b  hover:bg-gray-50 "
              >
                <th
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap "
                >
                  {item.state.toLocaleLowerCase()}
                </th>
                <th scope="row" className="py-4 px-6">
                  {item.count}
                </th>
                <td className="py-4 px-6">
                  {new Date(item.lastCreatedAtDate).toISOString()}
                </td>
                <td className="py-4 px-6">{lastCreatedrepo?.name}</td>
                <td className="py-4 px-6">
                  {item.lastClosedAtDate
                    ? new Date(item.lastClosedAtDate).toISOString()
                    : ""}
                </td>
                <td className="py-4 px-6">
                  {item.lastClosedAtDate ? lastClosedrepo?.name : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PullRequestsTable;
