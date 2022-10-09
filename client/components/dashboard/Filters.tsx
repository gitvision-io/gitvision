import React, { useEffect, useState } from "react";
import { getInstance } from "../../services/api";
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
    if (filters.organization) {
      setIsLoadingRepos(true);
      const org = organizations.find((o) => o.id === filters.organization);
      getInstance()
        .get(
          org?.isMain
            ? "/api/dashboard/repos"
            : `/api/dashboard/orgs/${filters.organization}/repos`
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

  useEffect(() => onChange(filters), [filters, onChange]);

  useEffect(() => {
    getInstance()
      .get("/api/dashboard/orgs")
      .then((res) => setOrganization(res.data));
  }, []);

  return (
    <>
      <div className="grid row-gap-8 sm:grid-cols-5">
        <div className="text-center pr-8">
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
        <div className="text-center pr-8">
          <Dropdown
            label={"Time"}
            items={times.map((t) => ({ ...t, value: t.label }))}
            value={filters.time}
            onChange={(v) => setFilters({ ...filters, time: v as string })}
          />
        </div>
        <div className="text-center">
          {isLoadingRepos && <Loader color="blue-600" className="mt-7" />}
          {!isLoadingRepos && (
            <Dropdown
              label={"Repositories"}
              items={repositories}
              value={filters.repositories}
              onChange={(v: string | number | (string | number)[]) =>
                setFilters({ ...filters, repositories: v as number[] })
              }
              multiple
            />
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardFilters;
