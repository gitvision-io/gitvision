import React, { useState } from "react";
import {
  Contributor,
  Issue,
  KpiCategory,
  PullRequest,
  RepositoryStatistics,
} from "../../common/types";
import DashboardFilters from "./Filters";
import Issues from "./Issues/Index";
import Kpis from "./Kpis";
import PullRequests from "./PullRequests/Index";
import { getInstance } from "../../services/api";
import Contributors from "./Contributors/Index";
import ActiveRepositories from "./ActiveRepositories/Index";
import Loader from "../common/Loader";
import Progress from "../common/Progress";
import useSynchronize from "./hooks/useSynchronize";

export interface DashboardComponentProps {
  initialSynchronization: boolean;
  initialOrganization?: string;
  baseOrgStatsUrl: string;
  baseOrgSearchUrl: string;
  onFiltersApplied?: (filters: Record<string, unknown>) => void;
}

function DashboardComponent({
  initialSynchronization,
  initialOrganization,
  baseOrgStatsUrl,
  baseOrgSearchUrl,
  onFiltersApplied,
}: DashboardComponentProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [repositories, setRepositories] = useState<RepositoryStatistics[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedKpi, setSelectedKpi] = useState<KpiCategory>(
    KpiCategory.Contributors
  );

  const { isSynchronizing, runningJob } = useSynchronize({
    initialSynchronization,
  });

  const onApplyFilters = (filters: Record<string, any>) => {
    onFiltersApplied?.(filters);
    if (filters.repositories && filters.time) {
      setFilters(filters);
      changeDashboard(filters);
    }
  };

  const groupByContributors = (data: []) => {
    const contributorsVar: Contributor[] = [];
    data
      .flatMap((r: Record<string, any>) => r.commits)
      .map((c: Contributor) => {
        const ctb: Contributor = {
          ...c,
          numberOfCommits: 1,
          commitActivity: 1,
        };
        if (ctb.author == c.author) {
          ctb.lineOfCodeChanges = c.numberOfLineAdded;
        }
        return ctb;
      })
      .reduce((res: Record<string, Contributor>, value: Contributor) => {
        if (!res[value.author]) {
          res[value.author] = {
            author: value.author,
            numberOfLineRemoved: 0,
            totalNumberOfLine: 0,
            numberOfLineAdded: 0,
            numberOfCommits: 0,
            commitActivity: 0,
          } as Contributor;
          contributorsVar.push(res[value.author]);
        }
        res[value.author].numberOfLineAdded += value.numberOfLineAdded;
        res[value.author].numberOfCommits += value.numberOfCommits;
        res[value.author].numberOfLineRemoved += value.numberOfLineRemoved;
        res[value.author].totalNumberOfLine += value.totalNumberOfLine;
        res[value.author].commitActivity += value.commitActivity;
        return res;
      }, {} as Record<string, Contributor>);
    return contributorsVar;
  };

  const changeDashboard = async (filters: Record<string, any>) => {
    const resp = await getInstance().get(
      `${baseOrgStatsUrl}/${encodeURIComponent(filters.organization)}`,
      {
        params: {
          filters,
        },
      }
    );

    setRepositories(resp.data);
    setIssues(resp.data.flatMap((r: Record<string, any>) => r.issues));
    setPullRequests(
      resp.data.flatMap((r: Record<string, any>) => r.pullRequests)
    );
    setContributors(
      groupByContributors(resp.data).sort(
        (p, c) => c.numberOfLineAdded - p.numberOfLineAdded
      )
    );
  };

  return (
    <>
      <DashboardFilters
        onChange={onApplyFilters}
        initialOrganization={initialOrganization}
        baseOrgSearchUrl={baseOrgSearchUrl}
      />

      {isSynchronizing && (
        <div className="text-center my-20">
          <div className="text-base font-medium text-blue-700 dark:text-white mb-2">
            Synchronizing with your git provider ...
          </div>
          <div className="m-auto max-w-lg flex items-center">
            <Loader text={""} color="gray-800" size={6} />
            <div className="flex-1">
              <Progress percent={runningJob?.progress || 5} />
            </div>
          </div>
        </div>
      )}

      {!isSynchronizing && (
        <>
          <Kpis
            contributors={contributors.length}
            activeRepositories={repositories.length}
            pullRequests={pullRequests.length}
            openIssues={issues.length}
            onChangeSelected={(selected) => setSelectedKpi(selected)}
            selected={selectedKpi}
          />

          {selectedKpi === KpiCategory.Contributors && (
            <Contributors
              contributors={contributors}
              repositories={repositories}
              filters={filters}
            />
          )}

          {selectedKpi === KpiCategory.ActiveRepositories && (
            <ActiveRepositories repositories={repositories} filters={filters} />
          )}

          {selectedKpi === KpiCategory.PullRequests && (
            <PullRequests
              pullRequests={pullRequests}
              repositories={repositories}
              filters={filters}
            />
          )}

          {selectedKpi === KpiCategory.Issues && (
            <Issues
              issues={issues}
              repositories={repositories}
              filters={filters}
            />
          )}
        </>
      )}
    </>
  );
}

DashboardComponent.defaultProps = {
  baseOrgStatsUrl: "/api/orgstats",
  baseOrgSearchUrl: "/api/orgs",
};

export default DashboardComponent;
