const Progress = ({ percent }: { percent: number }) => (
  <div className="w-full bg-gray-300 rounded-full shadow">
    <div
      className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
      style={{ width: `${percent}%` }}
    >
      {percent}%
    </div>
  </div>
);

export default Progress;
