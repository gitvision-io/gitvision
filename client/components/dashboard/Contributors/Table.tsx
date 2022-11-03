import { Contributor } from "../../../common/types";

const ContributorsTable = ({
  contributors,
}: {
  contributors: Contributor[];
}) => {
  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
          Most active contributors
        </caption>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="py-3 px-6">
              Username
            </th>
            <th scope="col" className="py-3 px-6">
              Number of commits
            </th>
            <th scope="col" className="py-3 px-6">
              Number of line added
            </th>
            <th scope="col" className="py-3 px-6">
              Number of line deleted
            </th>
            <th scope="col" className="py-3 px-6">
              Number of line modified
            </th>
            <th scope="col" className="py-3 px-6">
              Commit activity
            </th>
          </tr>
        </thead>
        <tbody>
          {contributors?.map((item) => {
            return (
              <tr
                key={item.author}
                className="bg-white border-b  hover:bg-gray-50 "
              >
                <th
                  scope="row"
                  className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap "
                >
                  {item.author}
                </th>
                <td className="py-4 px-6">{item.numberOfCommits}</td>
                <td className="py-4 px-6">{item.numberOfLineAdded}</td>
                <td className="py-4 px-6">{item.numberOfLineRemoved}</td>
                <td className="py-4 px-6">{item.totalNumberOfLine}</td>
                <td className="py-4 px-6">{item.commitActivity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ContributorsTable;
