import React, { useEffect, useState } from "react";
import Dropdown from "../components/Dropdown";
import Footer from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { getInstance } from "../services/api";

const times = [
  { label: "last hour" },
  { label: "last 5 hour" },
  { label: "yesterday" },
  { label: "last week" },
];

const repositories = [
  {
    label: "flagship-js-sdk",
    contributors: 5,
    activeRepository: 10,
    openIssues: 50,
  },
  {
    label: "flagship-ts-sdk",
    contributors: 5,
    activeRepository: 10,
    openIssues: 50,
  },
  {
    label: "flagship-go-sdk",
    contributors: 5,
    activeRepository: 10,
    openIssues: 50,
  },
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

function Home() {
  const [organizations, setOrganization] = useState([]);
  const [filters, setFilters] = useState<
    Record<string, string | number | (string | number)[]>
  >({});

  useEffect(() => {
    getInstance()
      .get("/api/dashboard/orgs")
      .then((res) =>
        setOrganization(
          res.data.map((o: { id: number; login: string }) => ({
            label: o.login,
            value: o.id,
          }))
        )
      );
  }, []);

  return (
    <div>
      <Navbar />
      <div className="px-4 py-10 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-10">
        <div className="grid row-gap-8 sm:grid-cols-5">
          <div className="text-center pr-8">
            <Dropdown
              label={"Organization"}
              items={organizations}
              value={filters.organization}
              onChange={(v: string | number) =>
                setFilters({ ...filters, organization: v })
              }
            />
          </div>
          <div className="text-center pr-8">
            <Dropdown
              label={"Time"}
              items={times.map((t) => ({ ...t, value: t.label }))}
              value={filters.time}
              onChange={(v: string | number) =>
                setFilters({ ...filters, time: v })
              }
            />
          </div>
          <div className="text-center">
            <Dropdown
              label={"Repositories"}
              items={repositories.map((t) => ({ ...t, value: t.label }))}
              value={filters.repositories}
              onChange={(v: string | number | (string | number)[]) => {
                console.log(v);
                setFilters({ ...filters, repositories: v });
              }}
              multiple
            />
          </div>
        </div>
      </div>
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-10">
        <div className="grid row-gap-8 sm:grid-cols-3">
          <div className="text-center">
            <p className="font-bold">Contributors</p>
            <h6 className="text-5xl font-bold text-deep-purple-accent-400">
              {repositories[0].contributors}
            </h6>
          </div>
          <div className="text-center">
            <p className="font-bold">Active repository</p>
            <h6 className="text-5xl font-bold text-deep-purple-accent-400">
              {repositories[0].activeRepository}
            </h6>
          </div>
          <div className="text-center">
            <p className="font-bold">Open issues</p>
            <h6 className="text-5xl font-bold text-deep-purple-accent-400">
              {repositories[0].openIssues}
            </h6>
          </div>
        </div>
      </div>
      <div className="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-10">
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
      </div>
      <Footer />
    </div>
  );
}

export default Home;
