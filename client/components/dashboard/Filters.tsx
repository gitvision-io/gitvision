import React, { useEffect, useState } from "react";
import { getInstance } from "../../services/api";
import Button from "../common/Button";
import Dropdown, { DropdownValue } from "../common/Dropdown";
import Loader from "../common/Loader";

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
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isLoadingSyncronize, setIsLoadingSynchronize] = useState(false);
  const [filters, setFilters] = useState<Filters>({});

  const applyFilters = () => {
    const org = organizations.find((o) => o.login === filters.organization);
    onChange({
      ...filters,
      organization: filters.organization,
      branches: filters.branches,
    });
  };

  const onClickSynchronize = () => {
    setIsLoadingSynchronize(true);
    getInstance()
      .post("/api/orgstats/synchronize")
      .finally(() => setIsLoadingSynchronize(false));
  };

  useEffect(() => {
    if (!filters.organization && organizations.length) {
      setFilters({ ...filters, organization: organizations[0].login });
    }
  }, [filters, organizations]);

  useEffect(() => {
    if (filters.organization) {
      setIsLoadingRepos(true);
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
              onChange={(v: DropdownValue) => {
                setFilters({ ...filters, repositories: v as string[] });
              }}
              disabled={!repositories.length}
              multiple
            />
          )}
        </div>
        {/* <div className="pr-8">
          <>
            {isLoadingRepos && <Loader color="blue-600" className="mb-2" />}
            {!isLoadingRepos && (
              <Dropdown
                label={"Branches"}
                items={repositories
                  .filter((r) => filters.repositories?.includes(r.name))
                  .flatMap((repo) => repo.branches.map((b) => ({ ...b, repo })))
                  .map((b) => ({
                    label: `${b.repo.name} - ${b.name}`,
                    value: `${b.repo.name};${b.name}`,
                  }))}
                value={filters.branches}
                onChange={(v) => {
                  setFilters({ ...filters, branches: v as string[] });
                }}
                disabled={!filters.repositories?.length}
                multiple
              />
            )}
          </>
        </div> */}
        <div>
          <Button
            variant="success"
            size="sm"
            className="w-24 mr-2"
            onClick={applyFilters}
          >
            Apply
          </Button>

          <Button
            size="sm"
            className="w-35"
            onClick={onClickSynchronize}
            isLoading={isLoadingSyncronize}
          >
            Synchronize
          </Button>
        </div>
      </div>
    </>
  );
}

export default DashboardFilters;
