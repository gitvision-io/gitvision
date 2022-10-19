interface KpisProps {
  contributors: any[];
  activeRepositories: number;
  pullRequests: number;
  openIssues: number;
}

const Kpis = ({
  contributors,
  activeRepositories,
  pullRequests,
  openIssues,
}: KpisProps) => {
  return (
    <div className="py-16 grid row-gap-8 sm:grid-cols-4">
      <div className="text-center">
        <p className="font-bold">Contributors</p>
        <h6 className="text-5xl font-bold text-deep-purple-accent-400">
          {contributors && contributors.length}
        </h6>
      </div>
      <div className="text-center">
        <p className="font-bold">Active repositories</p>
        <h6 className="text-5xl font-bold text-deep-purple-accent-400">
          {activeRepositories}
        </h6>
      </div>
      <div className="text-center">
        <p className="font-bold">Pull requests</p>
        <h6 className="text-5xl font-bold text-deep-purple-accent-400">
          {pullRequests}
        </h6>
      </div>
      <div className="text-center">
        <p className="font-bold">Open issues</p>
        <h6 className="text-5xl font-bold text-deep-purple-accent-400">
          {openIssues}
        </h6>
      </div>
    </div>
  );
};

export default Kpis;
