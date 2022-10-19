import React, { useEffect, useState } from "react";
import { Contributor, RepositoryStatistics } from "../common/types";
import Contributors from "../components/dashboard/Contributors/Index";
import DashboardFilters from "../components/dashboard/Filters";
import Kpis from "../components/dashboard/Kpis";
import { getInstance } from "../services/api";

function Dashboard() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [repositories, setRepositories] = useState<RepositoryStatistics[]>([]);
  const [openIssues, setOpenIssues] = useState(0);
  const [pullRequests, setPullRequests] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>({});

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
    setOpenIssues(
      resp.data
        .flatMap((r: Record<string, any>) => r.issues)
        .filter((i: Record<string, any>) => i.state === "OPEN").length
    );
    setPullRequests(
      resp.data
        .flatMap((r: Record<string, any>) => r.pullRequests)
        .filter((p: Record<string, any>) => p.state === "OPEN").length
    );
    setContributors(
      groupByContributors(resp.data).sort(
        (p, c) => c.numberOfLineAdded - p.numberOfLineAdded
      )
    );
  };

  useEffect(() => {
    getInstance().put("/api/users/me/repositories");
  }, []);

  return (
    <>
      <DashboardFilters
        onChange={(filters) => {
          onApplyFilters(filters);
        }}
      />

      <Kpis
        contributors={contributors}
        activeRepositories={repositories.length}
        pullRequests={pullRequests}
        openIssues={openIssues}
      />

      <Contributors
        contributors={contributors}
        repositories={repositories}
        filters={filters}
      />
    </>
  );
}

export default Dashboard;
