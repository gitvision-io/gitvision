import React, { useEffect, useState } from "react";
import { getInstance } from "../../services/api";
import Dropdown, { DropdownValue } from "../common/Dropdown";
import Loader from "../common/Loader";
import Synchronize from "./Synchronize";

const times = [
  { label: "last day" },
  { label: "last week" },
  { label: "last month" },
  { label: "last 3 months" },
  { label: "last 6 months" },
];

export interface Filters {
  organization?: string;
  time?: string;
  repositories?: string[];
  branches?: string[];
}

function DashboardFilters({
  onChange,
}: {
  onChange: (filters: Filters) => void;
}) {
  const [organizations, setOrganizations] = useState<
    {
      login: string;
      isUser: boolean;
    }[]
  >([]);
  const [repositories, setRepositories] = useState<string[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    if (filters.organization && filters.repositories?.length) {
      const org = organizations.find((o) => o.login === filters.organization);
      onChange({
        organization: org?.isUser ? "user" : filters.organization,
        repositories: filters.repositories,
        branches: filters.branches,
        time: filters.time,
      });
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (!filters.organization && organizations.length) {
      setFilters({
        ...filters,
        organization: organizations[0].login,
        time: times[2].label,
      });
    }
  }, [filters, organizations]);

  useEffect(() => {
    if (filters.organization) {
      setIsLoadingRepos(true);
      const org = organizations.find((o) => o.login === filters.organization);
      getInstance()
        .get(`/api/orgs/${org?.isUser ? "user" : filters.organization}/repos`)
        .then((res) => {
          setRepositories(res.data);
          setFilters({
            ...filters,
            repositories: res.data,
          });
          setIsLoadingRepos(false);
        });
    }
  }, [filters.organization, organizations]);

  const loadOrganizations = () =>
    getInstance()
      .get("/api/orgs")
      .then((res) => setOrganizations(res.data));

  useEffect(() => {
    loadOrganizations();
  }, []);

  return (
    <>
      <div className="grid row-gap-8 sm:grid-cols-5 items-end">
        <div className="pr-8">
          <Dropdown
            label={"Organization"}
            items={organizations.map((o: { login: string }) => ({
              label: o.login,
              value: o.login,
            }))}
            value={filters.organization}
            onChange={(v) =>
              setFilters({ ...filters, organization: v as string })
            }
          />
        </div>
        <div className="pr-8">
          <Dropdown
            label={"Time"}
            items={times.map((t) => ({ ...t, value: t.label }))}
            value={filters.time}
            defaultSelect={times[2].label}
            onChange={(v) => setFilters({ ...filters, time: v as string })}
          />
        </div>
        <div className="pr-8">
          {isLoadingRepos && <Loader color="blue-600" className="mb-2" />}
          {!isLoadingRepos && (
            <Dropdown
              label={"Repositories"}
              items={repositories.map((r) => ({
                label: r,
                value: r,
              }))}
              value={filters.repositories}
              onChange={(v: DropdownValue) => {
                setFilters({ ...filters, repositories: v as string[] });
              }}
              disabled={!repositories.length}
              multiple
            />
          )}
        </div>
        <div className="col-span-2">
          <Synchronize />
        </div>
      </div>
    </>
  );
}

export default DashboardFilters;
