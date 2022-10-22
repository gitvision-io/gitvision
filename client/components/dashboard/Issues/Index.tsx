import { Issue } from "../../../common/types";
import Tabs from "../../common/Tabs";
import IssuesTable from "./Table";
import IssuesHistory from "./History";

const Issues = ({
  issues,
  filters,
}: {
  issues: Issue[];
  filters: Record<string, any>;
}) => {
  const tabs = [
    {
      label: "Current",
      component: <IssuesTable issues={issues} />,
    },
    {
      label: "History",
      component: <IssuesHistory issues={issues} filters={filters} />,
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default Issues;
