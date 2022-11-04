import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { getInstance } from "../../../services/api";
import { asyncRefreshUser, userState } from "../../../services/state";

const useSynchronize = () => {
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [runningJob, setRunningJob] = useState<{
    finishedOn: number;
    progress: number;
  } | null>(null);
  const [user] = useAtom(userState);
  const [, refreshUser] = useAtom(asyncRefreshUser);
  const hasSynchronized = useRef(false);

  const synchronize = useCallback(() => {
    const pollSynchronize = (jobId: string | number) => {
      const timer = self.setInterval(() => {
        getInstance()
          .get(`/api/synchronize/jobs/${jobId}`)
          .then((res) => {
            setRunningJob(res.data);
            if (res.data.finishedOn) {
              self.clearInterval(timer);
              setIsSynchronizing(false);
              refreshUser();
            }
          });
      }, 2000);
    };

    setIsSynchronizing(true);
    getInstance()
      .post("/api/synchronize/jobs")
      .then((res) => {
        setRunningJob(res.data);
        pollSynchronize(res.data.id);
      });
  }, [refreshUser]);

  useEffect(() => {
    if (user !== null && !user.lastSynchronize && !hasSynchronized.current) {
      hasSynchronized.current = true;
      synchronize();
    }
  }, [synchronize, user]);

  return {
    isSynchronizing,
    runningJob,
  };
};

export default useSynchronize;
