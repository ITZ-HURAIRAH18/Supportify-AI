import { MessageSquare, Users, Package, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { useFetch } from '../hooks/useFetch';
import { getDashboardStats } from '../api';

const COLORS = {
  price_query: '#f54e00',
  order_status: '#9fbbe0',
  complaint: '#cf2d56',
  general: 'rgba(38,37,30,0.45)'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card border border-border rounded-md p-3 shadow-ambient">
        <p className="text-text-primary text-[12px] mb-1">{label}</p>
        <p className="text-accent text-[14px] font-medium font-display">
          {`${payload[0].value} conversations`}
        </p>
      </div>
    );
  }
  return null;
};

const buildWeeklyConversationData = (conversations = []) => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const days = [];

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() - i);
    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      name: labels[date.getDay()],
      value: 0,
    });
  }

  const map = new Map(days.map((d) => [d.key, d]));

  conversations.forEach((conv) => {
    const timestamp = conv?.timestamp ? new Date(conv.timestamp) : null;
    if (!timestamp || Number.isNaN(timestamp.getTime())) {
      return;
    }
    timestamp.setHours(0, 0, 0, 0);
    const key = `${timestamp.getFullYear()}-${timestamp.getMonth()}-${timestamp.getDate()}`;
    if (map.has(key)) {
      map.get(key).value += 1;
    }
  });

  return days;
};

const getTrendText = (series = []) => {
  if (series.length < 2) return '0%';
  const prev = series[series.length - 2].value;
  const curr = series[series.length - 1].value;
  if (prev === 0 && curr === 0) return '0%';
  if (prev === 0 && curr > 0) return '+100%';
  const pct = Math.round(((curr - prev) / prev) * 100);
  return `${pct > 0 ? '+' : ''}${pct}%`;
};

export default function Dashboard() {
  const { data, loading, error } = useFetch(getDashboardStats);

  const lineData = buildWeeklyConversationData(data?.conversationsData || []);
  const conversationTrend = getTrendText(lineData);

  const getIntentData = () => {
    if (!data?.conversationsData) return [];
    
    const intentCounts = data.conversationsData.reduce((acc, conv) => {
      acc[conv.intent] = (acc[conv.intent] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(intentCounts).map(([name, value]) => ({ name, value }));
  };

  const pieData = getIntentData();

  const columns = [
    { header: 'User', accessor: 'user_id', render: (row) => `#${row.user_id}` },
    { 
      header: 'Message', 
      accessor: 'message',
      render: (row) => (
        <span className="truncate max-w-[200px] inline-block" title={row.message}>
          {row.message.length > 40 ? `${row.message.substring(0, 40)}...` : row.message}
        </span>
      )
    },
    { 
      header: 'Intent', 
      accessor: 'intent',
      render: (row) => {
        let variant = 'gray';
        if (row.intent === 'price_query') variant = 'orange';
        if (row.intent === 'order_status') variant = 'info';
        if (row.intent === 'complaint') variant = 'danger';
        return <Badge label={row.intent.replace('_', ' ')} variant={variant} />;
      }
    },
    { 
      header: 'Time', 
      accessor: 'timestamp',
      render: (row) => new Date(row.timestamp).toLocaleString()
    }
  ];

  if (error) return <div className="text-status-danger-text">Failed to load dashboard data.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Conversations" 
          value={loading ? '...' : data?.conversations} 
          trend={loading ? '...' : conversationTrend}
          trendType="success"
          Icon={MessageSquare}
        />
        <StatCard 
          title="Active Users" 
          value={loading ? '...' : data?.users} 
          trend={loading ? '...' : `${data?.users || 0} total`}
          trendType="success"
          Icon={Users}
        />
        <StatCard 
          title="Products" 
          value={loading ? '...' : data?.products} 
          Icon={Package}
        />
        <StatCard 
          title="Confirmed Orders" 
          value={loading ? '...' : data?.confirmedOrders} 
          trend={loading ? '...' : `${data?.ordersData?.length || 0} total`} 
          trendType="warning"
          Icon={Clock}
          iconColor="#F97316"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[60%] min-w-0 bg-bg-card border border-border rounded-lg p-5 shadow-ambient">
          <h3 className="text-[14px] font-medium font-display text-text-primary mb-6">Conversations over last 7 days</h3>
          <div className="h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(38,37,30,0.12)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(38,37,30,0.55)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(38,37,30,0.55)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="#f54e00" strokeWidth={2} dot={{ r: 4, fill: '#f2f1ed', stroke: '#f54e00', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#f54e00', stroke: '#f2f1ed' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full lg:w-[40%] min-w-0 bg-bg-card border border-border rounded-lg p-5 shadow-ambient">
          <h3 className="text-[14px] font-medium font-display text-text-primary mb-6">Intent breakdown</h3>
          <div className="h-[300px] min-w-0 flex flex-col items-center justify-center relative">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240} minWidth={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name] || COLORS.general} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#e6e5e0', borderColor: 'rgba(38,37,30,0.1)', color: '#26251e' }} itemStyle={{ color: '#26251e' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-10%]">
                  <div className="text-[24px] font-normal tracking-[-0.02em] font-display text-text-primary">{data?.conversations}</div>
                  <div className="text-[12px] text-text-muted">Total</div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[12px] text-text-muted">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[entry.name] || COLORS.general }}></span>
                      {entry.name.replace('_', ' ')}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-text-muted text-[13px]">No intent data available</div>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[16px] font-medium font-display text-text-primary">Recent conversations</h3>
          <a href="/conversations" className="text-[13px] text-accent hover:text-accent-hover transition-colors font-medium">View all</a>
        </div>
        <DataTable 
          columns={columns} 
          data={data?.conversationsList || []} 
          loading={loading}
          emptyMessage="No recent conversations found"
        />
      </div>
    </div>
  );
}
