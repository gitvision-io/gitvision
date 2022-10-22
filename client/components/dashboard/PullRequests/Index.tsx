import { PullRequest } from "../../../common/types";
import Tabs from "../../common/Tabs";
import PullRequestsTable from "./Table";
import PullRequestsHistory from "./History";

const PullRequests = ({
  pullRequests,
  filters,
}: {
  pullRequests: PullRequest[];
  filters: Record<string, any>;
}) => {
  const tabs = [
    {
      label: "Current",
      component: <PullRequestsTable pullRequests={pullRequests} />,
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
