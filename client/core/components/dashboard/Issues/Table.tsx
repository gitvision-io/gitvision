import { useEffect, useState } from "react";
import { Issue, RepositoryStatistics } from "../../../common/types";

interface GroupedIssue {
  state: string;
  count: number;
  lastCreatedAtRepo: string;
  lastCreatedAtDate: Date;
  lastClosedAtRepo: string;
  lastClosedAtDate: string;
}

const IssuesTable = ({
  issues,
  repositories,
}: {
  issues: Issue[];
  repositories: RepositoryStatistics[];
}) => {
  const [groupedIssues, setGroupedIssues] = useState<GroupedIssue[]>([]);

  const groupByIssuesState = () => {
    const groupedIssues: GroupedIssue[] = [];
    issues.reduce((res: Record<string, GroupedIssue>, issue: Issue) => {
      if (!res[issue.state]) {
        res[issue.state] = {
          state: issue.state,
          count: 0,
          lastClosedAtDate: issue.closedAt,
          lastClosedAtRepo: issue.repoId,
          lastCreatedAtDate: issue.createdAt,
          lastCreatedAtRepo: issue.repoId,
        } as GroupedIssue;
        groupedIssues.push(res[issue.state]);
      }
      res[issue.state].count += 1;
      if (
        issue.closedAt &&
        Date.parse(res[issue.state].lastClosedAtDate) <
          Date.parse(issue.closedAt)
      ) {
        res[issue.state].lastClosedAtDate = issue.closedAt;
        res[issue.state].lastClosedAtRepo = issue.repoId;
      }
      if (res[issue.state].lastCreatedAtDate < issue.createdAt) {
        res[issue.state].lastCreatedAtDate = issue.createdAt;
        res[issue.state].lastCreatedAtRepo = issue.repoId;
      }
      return res;
    }, {} as Record<string, GroupedIssue>);
    return groupedIssues;
  };

  useEffect(() => {
    setGroupedIssues(groupByIssuesState());
  }, []);

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
          Issues
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
          {groupedIssues?.map((item) => {
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

export default IssuesTable;
