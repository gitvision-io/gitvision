import React, { useEffect, useState } from "react";
import { getInstance } from "../../services/api";
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

interface DashboardFiltersProps {
  onChange: (filters: Filters) => void;
  initialOrganization?: string;
  baseOrgSearchUrl: string;
}

function DashboardFilters({
  onChange,
  initialOrganization,
  baseOrgSearchUrl,
}: DashboardFiltersProps) {
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
    const newFilters = {
      ...filters,
    };
    let hasChanged = false;
    if (!filters.organization && organizations.length) {
      newFilters.organization = organizations[0].login;
      hasChanged = true;
    }
    if (!filters.time) {
      newFilters.time = times[2].label;
      hasChanged = true;
    }
    if (hasChanged) {
      setFilters(newFilters);
    }
  }, [filters, organizations]);

  useEffect(() => {
    if (filters.organization) {
      setIsLoadingRepos(true);
      const org = organizations.find((o) => o.login === filters.organization);
      getInstance()
        .get(
          `${baseOrgSearchUrl}/${
            org?.isUser ? "user" : encodeURIComponent(filters.organization)
          }/repos`
        )
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

  useEffect(() => {
    if (initialOrganization) {
      setOrganizations([{ login: initialOrganization, isUser: false }]);
      setFilters({ organization: initialOrganization });
      return;
    }
    getInstance()
      .get(baseOrgSearchUrl)
      .then((res) => setOrganizations(res.data));
  }, [initialOrganization]);

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
      </div>
    </>
  );
}

export default DashboardFilters;
