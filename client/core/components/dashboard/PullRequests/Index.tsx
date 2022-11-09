import { PullRequest, RepositoryStatistics } from "../../../common/types";
import Tabs from "../../common/Tabs";
import PullRequestsTable from "./Table";
import PullRequestsHistory from "./History";

const PullRequests = ({
  pullRequests,
  repositories,
  filters,
}: {
  pullRequests: PullRequest[];
  repositories: RepositoryStatistics[];
  filters: Record<string, any>;
}) => {
  const tabs = [
    {
      label: "Count",
      component: (
        <PullRequestsTable
          pullRequests={pullRequests}
          repositories={repositories}
        />
      ),
    },
    {
      label: "History",
      component: (
        <PullRequestsHistory pullRequests={pullRequests} filters={filters} />
      ),
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default PullRequests;
