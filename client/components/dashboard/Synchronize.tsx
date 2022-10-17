import React, { useState } from "react";
import { getInstance } from "../../services/api";
import Button from "../common/Button";

let timer: number | undefined;

function Synchronize() {
  const [isLoadingSyncronize, setIsLoadingSynchronize] = useState(false);
  const [runningJob, setRunningJob] = useState<{ finishedOn: number } | null>(
    null
  );

  const onClickSynchronize = () => {
    setIsLoadingSynchronize(true);
    getInstance()
      .post("/api/synchronize/jobs")
      .then((res) => {
        setIsLoadingSynchronize(false);
        setRunningJob(res.data);
        pollSynchronize(res.data.id);
      });
  };

  const pollSynchronize = (jobId: string | number) => {
    timer = self.setInterval(() => {
      getInstance()
        .get(`/api/synchronize/jobs/${jobId}`)
        .then((res) => {
          setRunningJob(res.data);
          if (res.data.finishedOn) {
            self.clearInterval(timer);
          }
        });
    }, 2000);
  };

  return (
    <Button
      size="sm"
      className="w-35"
      onClick={onClickSynchronize}
      isLoading={
        isLoadingSyncronize || Boolean(runningJob && !runningJob?.finishedOn)
      }
    >
      Synchronize
    </Button>
  );
}

export default Synchronize;
