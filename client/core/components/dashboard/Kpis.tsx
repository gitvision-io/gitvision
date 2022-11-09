import { KpiCategory } from "../../common/types";
import { classNames } from "../../common/utils";

interface KpisProps {
  contributors: number;
  activeRepositories: number;
  pullRequests: number;
  openIssues: number;
  onChangeSelected: (selected: KpiCategory) => unknown;
  selected: KpiCategory;
}

const KpiLabel: Record<KpiCategory, string> = {
  contributors: "Contributors",
  activeRepositories: "Active repositories",
  pullRequest: "Pull requests",
  issues: "Issues",
};

const Kpis = ({
  contributors,
  activeRepositories,
  pullRequests,
  openIssues,
  onChangeSelected,
  selected,
}: KpisProps) => {
  const KpiValues: Record<KpiCategory, number> = {
    [KpiCategory.Contributors]: contributors,
    [KpiCategory.ActiveRepositories]: activeRepositories,
    [KpiCategory.PullRequests]: pullRequests,
    [KpiCategory.Issues]: openIssues,
  };

  return (
    <div className="py-8 grid row-gap-8 sm:grid-cols-4">
      {Object.entries(KpiCategory).map(
        ([k, v]: [k: string, v: KpiCategory]) => (
          <div
            className={classNames(
              "text-center border py-8 mx-2 first:ml-0 last:mr-0 hover:bg-blue-50 hover:border hover:border-blue-100 hover:cursor-pointer",
              selected === v ? "bg-blue-50 rounded border border-blue-200" : ""
            )}
            key={k}
            onClick={() => onChangeSelected(v)}
          >
            <p className="font-bold">{KpiLabel[v]}</p>
            <h6 className="text-5xl font-bold text-deep-purple-accent-400">
              {KpiValues[v]}
            </h6>
          </div>
        )
      )}
    </div>
  );
};

export default Kpis;
