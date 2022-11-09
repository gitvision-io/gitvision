import { Issue, RepositoryStatistics } from "../../../common/types";
import Tabs from "../../common/Tabs";
import IssuesTable from "./Table";
import IssuesHistory from "./History";

const Issues = ({
  issues,
  repositories,
  filters,
}: {
  issues: Issue[];
  repositories: RepositoryStatistics[];
  filters: Record<string, any>;
}) => {
  const tabs = [
    {
      label: "Count",
      component: <IssuesTable repositories={repositories} issues={issues} />,
    },
    {
      label: "History",
      component: <IssuesHistory issues={issues} filters={filters} />,
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default Issues;
