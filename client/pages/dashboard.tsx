import React, { useState } from "react";
import {
  Contributor,
  Issue,
  KpiCategory,
  PullRequest,
  RepositoryStatistics,
} from "../common/types";
import ActiveRepositories from "../components/dashboard/ActiveRepositories/Index";
import Contributors from "../components/dashboard/Contributors/Index";
import DashboardFilters from "../components/dashboard/Filters";
import Issues from "../components/dashboard/Issues/Index";
import Kpis from "../components/dashboard/Kpis";
import PullRequests from "../components/dashboard/PullRequests/Index";
import { getInstance } from "../services/api";

function Dashboard() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [repositories, setRepositories] = useState<RepositoryStatistics[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [selectedKpi, setSelectedKpi] = useState<KpiCategory>(
    KpiCategory.Contributors
  );

  const onApplyFilters = (filters: Record<string, any>) => {
    if (filters.repositories) {
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
            numberOfLineModified: 0,
            numberOfLineAdded: 0,
            numberOfCommits: 0,
            commitActivity: 0,
          } as Contributor;
          contributorsVar.push(res[value.author]);
        }
        res[value.author].numberOfLineAdded += value.numberOfLineAdded;
        res[value.author].numberOfCommits += value.numberOfCommits;
        res[value.author].numberOfLineRemoved += value.numberOfLineRemoved;
        res[value.author].numberOfLineModified += value.numberOfLineModified;
        res[value.author].commitActivity += value.commitActivity;
        return res;
      }, {} as Record<string, Contributor>);
    return contributorsVar;
  };

  const changeDashboard = async (filters: Record<string, any>) => {
    const resp = await getInstance().get(
      `/api/orgstats/${filters.organization}`,
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
        onChange={(filters) => {
          onApplyFilters(filters);
        }}
      />

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
        <Issues issues={issues} repositories={repositories} filters={filters} />
      )}
    </>
  );
}

export default Dashboard;
