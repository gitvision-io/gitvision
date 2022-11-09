import { RepositoryStatistics } from "../../../common/types";
import Tabs from "../../common/Tabs";
import RepositoriesHistory from "./History";
import RepositoriesTable from "./Table";

const ActiveRepositories = ({
  repositories,
  filters,
}: {
  repositories: RepositoryStatistics[];
  filters: Record<string, any>;
}) => {
  const tabs = [
    {
      label: "Current",
      component: <RepositoriesTable repositories={repositories} />,
    },
    {
      label: "History",
      component: (
        <RepositoriesHistory repositories={repositories} filters={filters} />
      ),
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default ActiveRepositories;
