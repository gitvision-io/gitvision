import { useAtom } from "jotai";
import React, { useEffect } from "react";
import DashboardComponent from "../core/components/dashboard/Dashboard";
import { asyncRefreshUser } from "../core/services/state";

function Index() {
  const [, refreshUser] = useAtom(asyncRefreshUser);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return <DashboardComponent initialSynchronization />;
}

export default Index;
