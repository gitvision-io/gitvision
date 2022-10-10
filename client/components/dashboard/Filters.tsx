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
  organization?: number;
  time?: string;
  repositories?: number[];
}

function DashboardFilters({
  onChange,
}: {
  onChange: (filters: Filters) => void;
}) {
  const [organizations, setOrganization] = useState<
    {
      id: number;
      login: string;
      isMain: boolean;
    }[]
  >([]);
  const [repositories, setRepositories] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    if (!filters.organization && organizations.length) {
      setFilters({ ...filters, organization: organizations[0].id });
    }
  }, [filters, organizations]);

  useEffect(() => {
    if (filters.organization) {
      setIsLoadingRepos(true);
      const org = organizations.find((o) => o.id === filters.organization);
      getInstance()
        .get(
          org?.isMain
            ? "/api/github/repos"
            : `/api/github/orgs/${filters.organization}/repos`
        )
        .then((res) => {
          setRepositories(
            res.data.map((o: { id: number; name: string }) => ({
              label: o.name,
              value: o.id,
            }))
          );
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
            items={organizations.map(
              (o: { id: number; login: string; isMain: boolean }) => ({
                label: o.login,
                value: o.id,
              })
            )}
            value={filters.organization}
            onChange={(v) =>
              setFilters({ ...filters, organization: v as number })
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
              items={repositories}
              value={filters.repositories}
              onChange={(v: string | number | (string | number)[]) =>
                setFilters({ ...filters, repositories: v as number[] })
              }
              multiple
              disabled={!repositories.length}
            />
          )}
        </div>
        <Button
          variant="success"
          size="sm"
          className="w-24"
          onClick={() => onChange(filters)}
        >
          Apply
        </Button>
      </div>
    </>
  );
}

export default DashboardFilters;
