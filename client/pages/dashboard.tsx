import React, { useEffect, useState } from "react";
import DashboardFilters from "../components/dashboard/Filters";
import { getInstance } from "../services/api";

interface Contributor {
  author: string;
  numberOfCommits: number;
  lineOfCodeChanges: number;
  commitActivity: number;
  numberOfLineAdded: number;
  date: Date;
}

function Dashboard() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [activeRepository, setActiveRepository] = useState(0);
  const [openIssues, setOpenIssues] = useState(0);
  const [pullRequests, setPullRequests] = useState(0);

  const onApplyFilters = (filters: Record<string, any>) => {
    if (filters.repositories) {
      changeDashboard(filters);
    }
  };

  const getPullRequestsByRepo = (org: string, filters: Record<string, any>) => {
    return getInstance()
      .get(`/api/orgstats/${org}/pullRequests`, {
        params: {
          filters,
        },
      })
      .then((rest) => {
        setPullRequests(
          rest.data
            .flatMap((r: Record<string, any>) => r.pullRequests)
            .filter((p: Record<string, any>) => p.state === "OPEN").length
        );
      });
  };

  const getIssuesByRepo = (org: string, filters: Record<string, any>) => {
    return getInstance()
      .get(`/api/orgstats/${org}/issues`, {
        params: {
          filters,
        },
      })
      .then((rest) => {
        setOpenIssues(
          rest.data
            .flatMap((r: Record<string, any>) => r.issues)
            .filter((i: Record<string, any>) => i.state === "OPEN").length
        );
      });
  };

  const getContributersByRepo = (org: string, filters: Record<string, any>) => {
    return getInstance()
      .get(`/api/orgstats/${org}`, {
        params: {
          filters,
        },
      })
      .then((rest) => {
        setActiveRepository(rest.data.length);
        const contributorsVar: Contributor[] = [];
        rest.data
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
                numberOfLineAdded: 0,
                numberOfCommits: 0,
                commitActivity: 0,
              } as Contributor;
              contributorsVar.push(res[value.author]);
            }
            res[value.author].numberOfLineAdded += value.numberOfLineAdded;
            res[value.author].numberOfCommits += value.numberOfCommits;
            res[value.author].commitActivity += value.commitActivity;
            return res;
          }, {} as Record<string, Contributor>);
        return contributorsVar;
      });
  };

  const changeDashboard = async (filters: Record<string, any>) => {
    setContributors([]);
    const data = await getContributersByRepo(filters.organization, filters);
    await getIssuesByRepo(filters.organization, filters);
    await getPullRequestsByRepo(filters.organization, filters);

    setContributors(
      data.sort((p, c) => c.numberOfLineAdded - p.numberOfLineAdded)
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

      <div className="py-16 grid row-gap-8 sm:grid-cols-4">
        <div className="text-center">
          <p className="font-bold">Contributors</p>
          <h6 className="text-5xl font-bold text-deep-purple-accent-400">
            {contributors && contributors.length}
          </h6>
        </div>
        <div className="text-center">
          <p className="font-bold">Active repository</p>
          <h6 className="text-5xl font-bold text-deep-purple-accent-400">
            {activeRepository}
          </h6>
        </div>
        <div className="text-center">
          <p className="font-bold">Pull requests</p>
          <h6 className="text-5xl font-bold text-deep-purple-accent-400">
            {pullRequests}
          </h6>
        </div>
        <div className="text-center">
          <p className="font-bold">Open issues</p>
          <h6 className="text-5xl font-bold text-deep-purple-accent-400">
            {openIssues}
          </h6>
        </div>
      </div>

      <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
            Most active contributors
          </caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="py-3 px-6">
                Username
              </th>
              <th scope="col" className="py-3 px-6">
                Number of commits
              </th>
              <th scope="col" className="py-3 px-6">
                Number of line added
              </th>
              <th scope="col" className="py-3 px-6">
                Commit activity
              </th>
            </tr>
          </thead>
          <tbody>
            {contributors &&
              contributors.map((item) => {
                return (
                  <tr
                    key={item.author}
                    className="bg-white border-b  hover:bg-gray-50 "
                  >
                    <th
                      scope="row"
                      className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap "
                    >
                      {item.author}
                    </th>
                    <td className="py-4 px-6">{item.numberOfCommits}</td>
                    <td className="py-4 px-6">{item.numberOfLineAdded}</td>
                    <td className="py-4 px-6">{item.commitActivity}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Dashboard;
