import { Users as UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { useFetch } from "../hooks/useFetch";
import { getUsers, getConversations } from "../api";

export default function Users() {
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(async () => {
    const [users, conversations] = await Promise.all([
      getUsers(0, 100),
      getConversations(0, 5000),
    ]);

    const conversationCountByUser = conversations.reduce((acc, conv) => {
      const key = conv.user_id;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return users.map((user) => ({
      ...user,
      conversationsCount: conversationCountByUser[user.id] || 0,
    }));
  });

  const columns = [
    { 
      header: 'Avatar', 
      accessor: 'avatar',
      render: (row) => (
        <div className="w-[36px] h-[36px] rounded-full bg-accent-muted-bg border border-accent/20 flex items-center justify-center text-accent-muted-text font-semibold text-[14px]">
          {row.name.substring(0, 2).toUpperCase()}
        </div>
      )
    },
    { 
      header: 'Name', 
      accessor: 'name',
      render: (row) => <span className="font-medium">{row.name}</span>
    },
    { 
      header: 'Phone / Email', 
      accessor: 'contact',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[13px]">{row.email}</span>
          {row.phone && <span className="text-[12px] text-text-muted">{row.phone}</span>}
        </div>
      )
    },
    { 
      header: 'Joined Date', 
      accessor: 'created_at',
      render: (row) => <span className="text-text-muted text-[13px]">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Total Conversations',
      accessor: 'conversations',
      render: (row) => <span className="text-text-muted text-[13px]">{row.conversationsCount}</span>
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => navigate(`/conversations?userId=${row.id}`)}
          className="px-3 py-1.5 border border-border rounded-pill text-[12px] font-medium font-display text-text-primary hover:bg-bg-hover hover:text-accent transition-colors"
        >
          View
        </button>
      )
    }
  ];

  if (error) return <div className="text-status-danger-text p-6">Failed to load users.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-bg-card p-4 rounded-lg border border-border shadow-ambient">
        <h1 className="text-[20px] font-normal tracking-[-0.02em] font-display text-text-primary flex items-center gap-2">
          Users
          {!loading && data && <Badge label={data.length} variant="gray" />}
        </h1>
      </div>

      <DataTable 
        columns={columns} 
        data={data || []} 
        loading={loading}
        emptyMessage={
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <UsersIcon className="w-8 h-8 text-text-muted" />
            <p>No users yet</p>
          </div>
        }
      />
    </div>
  );
}
