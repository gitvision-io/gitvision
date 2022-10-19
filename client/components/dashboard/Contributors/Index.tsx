import { Tab } from "@headlessui/react";
import { Contributor, RepositoryStatistics } from "../../../common/types";
import { classNames } from "../../../common/utils";
import Tabs from "../../common/Tabs";
import ContributorsHistory from "./History";
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
      label: "Hall of fame",
      component: <ContributorsTable contributors={contributors} />,
    },
    {
      label: "History",
      component: (
        <ContributorsHistory repositories={repositories} filters={filters} />
      ),
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default Contributors;
