import React, { useState } from "react";
import { getInstance } from "../../services/api";
import Button from "../common/Button";

let timer: number | undefined;

function Synchronize() {
  const [isLoadingSynchronize, setIsLoadingSynchronize] = useState(false);
  const [isSynchronizedDisabled, setIsSynchronizedDisabled] = useState(false);
  const [runningJob, setRunningJob] = useState<{ finishedOn: number } | null>(
    null
  );

  const onClickSynchronize = () => {
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
        isLoadingSynchronize || Boolean(runningJob && !runningJob?.finishedOn)
      }
      isDisabled={
        isSynchronizedDisabled || Boolean(runningJob && !runningJob?.finishedOn)
      }
    >
      Synchronize
    </Button>
  );
}

export default Synchronize;
