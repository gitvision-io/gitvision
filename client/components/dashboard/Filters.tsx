import React, { useEffect, useState } from "react";
import { getInstance } from "../../services/api";
import Button from "../common/Button";
import Dropdown from "../common/Dropdown";
import Loader from "../common/Loader";

const times = [
  { label: "last hour" },
  { label: "last 5 hour" },
  { label: "yesterday" },
  { label: "last week" },
];

export interface Filters {
  organization?: string;
  time?: string;
  repository?: string;
  branch?: string;
}

export interface Repository {
  id: string;
  name: string;
  branches: { name: string }[];
}

function DashboardFilters({
  onChange,
}: {
  onChange: (filters: Filters) => void;
}) {
  const [organizations, setOrganization] = useState<
    {
      id: string;
      login: string;
      isUser: boolean;
    }[]
  >([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [repository, setRepository] = useState<Repository>();
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const [filters, setFilters] = useState<Filters>({});

  const applyFilters = () => {
    const org = organizations.find((o) => o.login === filters.organization);
    onChange({
      ...filters,
      organization: org?.isUser ? "user" : filters.organization,
      branch: filters.branch,
    });
  };

  useEffect(() => {
    if (!filters.organization && organizations.length) {
      setFilters({ ...filters, organization: organizations[0].login });
    }
  }, [filters, organizations]);

  useEffect(() => {
    if (filters.organization) {
      setIsLoadingRepos(true);
      setIsLoadingBranches(true);
      const org = organizations.find((o) => o.login === filters.organization);
      getInstance()
        .get(
          org?.isUser
            ? "/api/github/repos"
            : `/api/github/orgs/${filters.organization}/repos`
        )
        .then((res) => {
          setRepositories(res.data);
          setIsLoadingRepos(false);
        });
    }
  }, [filters.organization, organizations]);

  useEffect(() => {
    getInstance()
      .get("/api/github/orgs")
      .then((res) => setOrganization(res.data));
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
            onChange={(v) => setFilters({ ...filters, time: v as string })}
          />
        </div>
        <div className="pr-8">
          {isLoadingRepos && <Loader color="blue-600" className="mb-2" />}
          {!isLoadingRepos && (
            <Dropdown
              label={"Repositories"}
              items={repositories.map((r) => ({
                label: r.name,
                value: r.name,
              }))}
              value={filters.repository}
              onChange={(v) => {
                setFilters({ ...filters, repository: v as string });
                setRepository(
                  repositories.find((r) => r.name === v.toString())
                );
                setIsLoadingBranches(false);
              }}
              disabled={!repositories.length}
            />
          )}
        </div>
        <div className="pr-8">
          {isLoadingBranches && <Loader color="blue-600" className="mb-2" />}
          {repository && !isLoadingBranches && (
            <Dropdown
              label={"Branches"}
              items={repository.branches?.map((b) => ({
                label: b.name,
                value: b.name,
              }))}
              value={filters.branch}
              onChange={(v) => {
                setFilters({ ...filters, branch: v as string });
              }}
              disabled={!repository?.branches?.length}
            />
          )}
        </div>
        <Button
          variant="success"
          size="sm"
          className="w-24"
          onClick={applyFilters}
        >
          Apply
        </Button>
      </div>
    </>
  );
}

export default DashboardFilters;
