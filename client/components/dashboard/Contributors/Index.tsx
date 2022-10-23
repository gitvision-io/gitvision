import { Contributor, RepositoryStatistics } from "../../../common/types";
import Tabs from "../../common/Tabs";
import ContributorsHistory from "./History";
import ContributorsRankingHistory from "./RankingHistory";
import ContributorsTable from "./Table";

const Contributors = ({
  contributors,
  repositories,
  filters,
}: {
  contributors: Contributor[];
  repositories: RepositoryStatistics[];
  filters: Record<string, any>;
}) => {
  const tabs = [
    {
      label: "Ranking",
      component: <ContributorsTable contributors={contributors} />,
    },
    {
      label: "Ranking history",
      component: (
        <ContributorsRankingHistory
          repositories={repositories}
          filters={filters}
        />
      ),
    },
    {
      label: "History",
      component: (
        <ContributorsHistory
          repositories={repositories}
          filters={filters}
        />
      ),
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default Contributors;
