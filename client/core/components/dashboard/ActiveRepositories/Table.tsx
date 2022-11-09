import { RepositoryStatistics } from "../../../common/types";

const RepositoriesTable = ({
  repositories,
}: {
  repositories: RepositoryStatistics[];
}) => {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
          Active repositories
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              Id
            </th>
            <th scope="col" className="py-3 px-6">
              Name
            </th>
            <th scope="col" className="py-3 px-6">
              Number of commits
            </th>
            <th scope="col" className="py-3 px-6">
              Latest commit
            </th>
            <th scope="col" className="py-3 px-6">
              Number of pull requests
            </th>
            <th scope="col" className="py-3 px-6">
              Number of issues
            </th>
          </tr>
        </thead>
        <tbody>
          {repositories?.map((item) => {
            return (
              <tr
                key={item.id}
                className="bg-white border-b  hover:bg-gray-50 "
              >
                <td
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap "
                >
                  {item.id}
                </td>
                <td
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap "
                >
                  {item.name}
                </td>
                <td className="py-4 px-6">{item.commits.length}</td>
                <td className="py-4 px-6">
                  {new Date(
                    Math.max(
                      ...item.commits.map((c) => new Date(c.date).getTime())
                    )
                  ).toISOString()}
                </td>
                <td className="py-4 px-6">{item.pullRequests.length}</td>
                <td className="py-4 px-6">{item.issues.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RepositoriesTable;
