import React, { useState } from "react";
import DashboardFilters, { Filters } from "../components/dashboard/Filters";
import { getInstance } from "../services/api";

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
  const onApplyFilters = (filters: Record<string, any>) => {
    getInstance().get("/api/dashboard/analytics", {
      params: {
        filters,
      },
    });
  };

  return (
    <>
      <DashboardFilters onChange={(filters) => onApplyFilters(filters)} />

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
