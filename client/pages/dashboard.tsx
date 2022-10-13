import React, { useEffect, useState } from "react";
import DashboardFilters, { Filters } from "../components/dashboard/Filters";
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
  const [contributorsLocal, setContributorsLocal] = useState<Contributor[]>([]);
  const [activeRepository, setActiveRepository] = useState(0);
  const [openIssues, setOpenIssues] = useState(0);
  const [filters, setFilters] = useState<Record<string, any>>();

  const onApplyFilters = (filters: Record<string, any>) => {
    getInstance().get("/api/dashboard/analytics", {
      params: {
        filters,
      },
    });
  };

  const getContributersByRepo = (org: string, repo: string) => {
    return getInstance()
      .get(`/api/repostats/org/${org}/repo/${repo}`)
      .then((rest) => {
        let contributorsVar: Contributor[] = [];
        rest.data.usersRepoStats
          .map((c: Contributor) => {
            var ctb: Contributor = {
              author: c.author,
              numberOfCommits: 1,
              lineOfCodeChanges: c.lineOfCodeChanges,
              commitActivity: 1,
              numberOfLineAdded: c.numberOfLineAdded,
              date: c.date,
            };
            if (ctb.author == c.author) {
              ctb.lineOfCodeChanges = c.numberOfLineAdded;
            }
            return ctb;
          })
          .reduce((res: Contributor, value: Contributor) => {
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
          }, {} as Contributor);
        return contributorsVar;
      });
  };

  useEffect(() => {
    setContributors([]);
    console.log("button clicked");
    const fetchData = async (org: string, r: string) => {
      return await getContributersByRepo(org, r);
    };
    if (filters) {
      let allRepoContributors: Contributor[] = [];
      filters.repositories?.forEach((r: string) => {
        fetchData(filters.organization, r)
          .then((res) => {
            allRepoContributors = allRepoContributors.concat(res);
            setContributorsLocal(allRepoContributors);
          })
          .catch(console.error);
      });
      let constvar: Contributor[] = [];

      contributorsLocal
        .map((c: Contributor) => {
          var ctb: Contributor = {
            author: c.author,
            numberOfCommits: 1,
            lineOfCodeChanges: c.lineOfCodeChanges,
            commitActivity: 1,
            numberOfLineAdded: c.numberOfLineAdded,
            date: c.date,
          };
          if (ctb.author == c.author) {
            ctb.lineOfCodeChanges = c.numberOfLineAdded;
          }
          return ctb;
        })
        .reduce((res: Contributor, value: Contributor) => {
          if (!res[value.author]) {
            res[value.author] = {
              author: value.author,
              numberOfLineAdded: 0,
              numberOfCommits: 0,
              commitActivity: 0,
            } as Contributor;
            constvar.push(res[value.author]);
          }
          res[value.author].numberOfLineAdded += value.numberOfLineAdded;
          res[value.author].numberOfCommits += value.numberOfCommits;
          res[value.author].commitActivity += value.commitActivity;
          return res;
        }, {} as Contributor);

      setContributors(
        constvar.sort((p, c) => c.numberOfLineAdded - p.numberOfLineAdded)
      );
    }
  }, [filters]);

  return (
    <>
      <DashboardFilters
        onChange={(filters) => {
          onApplyFilters(filters);
          setFilters(filters);
        }}
      />

      <div className="py-16 grid row-gap-8 sm:grid-cols-3">
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
