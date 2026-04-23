import { MessageSquare, Users, Package, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import { useFetch } from '../hooks/useFetch';
import { getDashboardStats } from '../api';

const COLORS = {
  price_query: '#F97316',
  order_status: '#3B82F6',
  complaint: '#EF4444',
  general: '#71717A'
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card border border-accent rounded-md p-3 shadow-xl">
        <p className="text-text-primary text-[12px] mb-1">{label}</p>
        <p className="text-accent text-[14px] font-semibold">
          {`${payload[0].value} conversations`}
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { data, loading, error } = useFetch(getDashboardStats);

  // Mock data for charts since backend doesn't have timeseries aggregation yet
  const lineData = [
    { name: 'Mon', value: 40 },
    { name: 'Tue', value: 30 },
    { name: 'Wed', value: 45 },
    { name: 'Thu', value: 50 },
    { name: 'Fri', value: 65 },
    { name: 'Sat', value: 55 },
    { name: 'Sun', value: 70 },
  ];

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
          trend="+12%" 
          trendType="success"
          Icon={MessageSquare}
        />
        <StatCard 
          title="Active Users" 
          value={loading ? '...' : data?.users} 
          trend="+5%" 
          trendType="success"
          Icon={Users}
        />
        <StatCard 
          title="Products" 
          value={loading ? '...' : data?.products} 
          Icon={Package}
        />
        <StatCard 
          title="Pending Orders" 
          value={loading ? '...' : data?.pendingOrders} 
          trend="3 urgent" 
          trendType="warning"
          Icon={Clock}
          iconColor="#F97316"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[60%] min-w-0 bg-bg-card border border-border rounded-lg p-5">
          <h3 className="text-[14px] font-medium text-text-primary mb-6">Conversations over last 7 days</h3>
          <div className="h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height={300} minWidth={0}>
              <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1F1F" vertical={false} />
                <XAxis dataKey="name" stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={2} dot={{ r: 4, fill: '#0A0A0A', stroke: '#F97316', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#F97316', stroke: '#0A0A0A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="w-full lg:w-[40%] min-w-0 bg-bg-card border border-border rounded-lg p-5">
          <h3 className="text-[14px] font-medium text-text-primary mb-6">Intent breakdown</h3>
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
                    <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#2A2A2A', color: '#F5F5F5' }} itemStyle={{ color: '#F5F5F5' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mt-[-10%]">
                  <div className="text-[24px] font-semibold text-text-primary">{data?.conversations}</div>
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
          <h3 className="text-[16px] font-medium text-text-primary">Recent conversations</h3>
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
