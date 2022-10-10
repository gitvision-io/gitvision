import React, { useEffect, useState } from "react";
import Dropdown from "../components/common/Dropdown";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { getInstance } from "../services/api";

const times = [
  { label: "last hour" },
  { label: "last 5 hour" },
  { label: "yesterday" },
  { label: "last week" },
];

const contributors = [
  {
    username: "guillaume.jaquart",
    numberOfCommits: "100",
    lineOfCodeChanges: "5000",
    commitActivity: "20",
  },
  {
    username: "Chadiii",
    numberOfCommits: "50",
    lineOfCodeChanges: "2000",
    commitActivity: "10",
  },
  {
    username: "John.Doe",
    numberOfCommits: "5",
    lineOfCodeChanges: "400",
    commitActivity: "2",
  },
];

function Dashboard() {
  const [organizations, setOrganization] = useState([]);
  const [repositories, setRepositories] = useState([]);

  const [filters, setFilters] = useState<
    Record<string, string | number | (string | number)[]>
  >({});

  useEffect(() => {
    if (filters.organization) {
      getInstance()
        .get(`/api/dashboard/orgs/${filters.organization}/repos`)
        .then((res) =>
          setRepositories(
            res.data.map((o: { id: number; name: string }) => ({
              label: o.name,
              value: o.id,
            }))
          )
        );
    }
  }, [filters]);

  useEffect(() => {
    getInstance()
      .get("/api/dashboard/orgs")
      .then((res) =>
        setOrganization(
          res.data.map((o: { id: string; login: string }) => ({
            label: o.login,
            value: o.login,
          }))
        )
      );
  }, []);

  return (
    <>
      <div className="grid row-gap-8 sm:grid-cols-5">
        <div className="text-center pr-8">
          <Dropdown
            label={"Organization"}
            items={organizations}
            value={filters.organization}
            onChange={(v) => setFilters({ ...filters, organization: v })}
          />
        </div>
        <div className="text-center pr-8">
          <Dropdown
            label={"Time"}
            items={times.map((t) => ({ ...t, value: t.label }))}
            value={filters.time}
            onChange={(v) => setFilters({ ...filters, time: v })}
          />
        </div>
        <div className="text-center">
          <Dropdown
            label={"Repositories"}
            items={repositories}
            value={filters.repositories}
            onChange={(v: string | number | (string | number)[]) =>
              setFilters({ ...filters, repositories: v })
            }
            multiple
          />
        </div>
      </div>

      <div className="py-16 grid row-gap-8 sm:grid-cols-3">
        <div className="text-center">
          <p className="font-bold">Contributors</p>
          <h6 className="text-5xl font-bold text-deep-purple-accent-400">10</h6>
        </div>
        <div className="text-center">
          <p className="font-bold">Active repository</p>
          <h6 className="text-5xl font-bold text-deep-purple-accent-400">10</h6>
        </div>
        <div className="text-center">
          <p className="font-bold">Open issues</p>
          <h6 className="text-5xl font-bold text-deep-purple-accent-400">10</h6>
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
                Line of code changes
              </th>
              <th scope="col" className="py-3 px-6">
                Commit activity
              </th>
            </tr>
          </thead>
          <tbody>
            {contributors.map((item) => {
              return (
                <tr
                  key={item.username}
                  className="bg-white border-b  hover:bg-gray-50 "
                >
                  <th
                    scope="row"
                    className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap "
                  >
                    {item.username}
                  </th>
                  <td className="py-4 px-6">{item.numberOfCommits}</td>
                  <td className="py-4 px-6">{item.lineOfCodeChanges}</td>
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
