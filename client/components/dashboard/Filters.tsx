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
  repositories?: string[];
  branches?: string[];
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
  const [selectedRepositories, setSelectedRepositories] = useState<
    Repository[]
  >([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);

  const [filters, setFilters] = useState<Filters>({});

  const applyFilters = () => {
    const org = organizations.find((o) => o.login === filters.organization);
    onChange({
      ...filters,
      organization: org?.isUser ? "user" : filters.organization,
      branches: filters.branches,
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
              value={filters.repositories}
              onChange={(v: string[]) => {
                setFilters({ ...filters, repositories: v as string[] });
                setSelectedRepositories([
                  ...selectedRepositories.filter((r) => v.includes(r.name)),
                  ...repositories.filter(
                    (r) =>
                      v.includes(r.name) &&
                      !selectedRepositories.find((item) => item.name === r.name)
                  ),
                ]);
                setIsLoadingBranches(false);
              }}
              disabled={!repositories.length}
              multiple
            />
          )}
        </div>
        <div className="pr-8">
          <>
            {isLoadingBranches && <Loader color="blue-600" className="mb-2" />}
            {selectedRepositories && !isLoadingBranches && (
              <Dropdown
                label={"Branches"}
                items={selectedRepositories.map((repo) =>
                  repo.branches.map((b) => ({
                    label: b.name,
                    value: b.name,
                  }))
                )}
                value={filters.branches}
                onChange={(v) => {
                  setFilters({ ...filters, branches: v as string[] });
                }}
                //disabled={!selectedRepositories?.branches?.length}
                multiple
              />
            )}
          </>
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
