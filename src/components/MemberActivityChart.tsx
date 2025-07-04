import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface ActivityData {
  month: string;
  activityCount: number;
}

interface Props {
  data: ActivityData[];
}

export const MemberActivityChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-[300px] bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4">Aktivitas Member per Bulan</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="activityCount" stroke="#2563eb" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
