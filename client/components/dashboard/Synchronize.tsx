import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { getInstance } from "../../services/api";
import { asyncRefreshUser, userState } from "../../services/state";
import Button from "../common/Button";

function Synchronize() {
  const [isLoadingSynchronize, setIsLoadingSynchronize] = useState(false);
  const [isSynchronizedDisabled, setIsSynchronizedDisabled] = useState(false);
  const [runningJob, setRunningJob] = useState<{ finishedOn: number } | null>(
    null
  );
  const [user] = useAtom(userState);
  const [, refreshUser] = useAtom(asyncRefreshUser);
  const hasSynchronized = useRef(false);

  const onClickSynchronize = useCallback(() => {
    const pollSynchronize = (jobId: string | number) => {
      const timer = self.setInterval(() => {
        getInstance()
          .get(`/api/synchronize/jobs/${jobId}`)
          .then((res) => {
            setRunningJob(res.data);
            if (res.data.finishedOn) {
              self.clearInterval(timer);
              refreshUser();
            }
          });
      }, 2000);
    };

    setIsLoadingSynchronize(true);
    setIsSynchronizedDisabled(true);
    getInstance()
      .post("/api/synchronize/jobs")
      .then((res) => {
        setIsLoadingSynchronize(false);
        setIsSynchronizedDisabled(false);
        setRunningJob(res.data);
        pollSynchronize(res.data.id);
      });
  }, [refreshUser]);

  useEffect(() => {
    if (user !== null && !user.lastSynchronize && !hasSynchronized.current) {
      hasSynchronized.current = true;
      onClickSynchronize();
    }
  }, [onClickSynchronize, user]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <div className="flex items-center">
      <Button
        size="sm"
        className="w-35"
        onClick={onClickSynchronize}
        isLoading={
          isLoadingSynchronize || Boolean(runningJob && !runningJob?.finishedOn)
        }
        isDisabled={
          isSynchronizedDisabled ||
          Boolean(runningJob && !runningJob?.finishedOn)
        }
        loadingText="Synchronizing..."
      >
        Synchronize
      </Button>
      {user?.lastSynchronize && (
        <div className="text-sm italic ml-2 text-gray-700">
          Synchronized at {user?.lastSynchronize}
        </div>
      )}
    </div>
  );
}

export default Synchronize;
