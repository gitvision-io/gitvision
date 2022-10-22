import { Issue } from "../../../common/types";

const IssuesTable = ({ issues }: { issues: Issue[] }) => {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
          Issues
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              ID
            </th>
            <th scope="col" className="py-3 px-6">
              Repository
            </th>
            <th scope="col" className="py-3 px-6">
              Created at
            </th>
            <th scope="col" className="py-3 px-6">
              Closed at
            </th>
            <th scope="col" className="py-3 px-6">
              State
            </th>
          </tr>
        </thead>
        <tbody>
          {issues?.map((item) => {
            return (
              <tr
                key={item.id}
                className="bg-white border-b  hover:bg-gray-50 "
              >
                <th
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap "
                >
                  {item.id}
                </th>
                <td className="py-4 px-6">{item.repoId}</td>
                <td className="py-4 px-6">
                  {new Date(item.createdAt).toISOString()}
                </td>
                <td className="py-4 px-6">
                  {item.closedAt ? new Date(item.closedAt).toISOString() : ""}
                </td>
                <td className="py-4 px-6">{item.state}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default IssuesTable;
