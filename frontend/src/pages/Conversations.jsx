import { useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { useFetch } from "../hooks/useFetch";
import { getConversations } from "../api";

export default function Conversations() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const limit = 10;
  
  // In a real app, pagination is handled by passing (page-1)*limit to the API
  const { data, loading, error } = useFetch(() => getConversations(0, 100));

  const filteredData = data?.filter(conv => 
    conv.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
    conv.user_id.toString().includes(searchTerm)
  ) || [];

  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filteredData.length / limit) || 1;

  const columns = [
    { header: '#', accessor: 'id', render: (row) => <span className="text-text-muted">{row.id}</span> },
    { header: 'User ID', accessor: 'user_id', render: (row) => `#${row.user_id}` },
    { 
      header: 'Message', 
      accessor: 'message',
      render: (row) => (
        <span className="truncate max-w-[200px] inline-block cursor-help" title={row.message}>
          {row.message.length > 30 ? `${row.message.substring(0, 30)}...` : row.message}
        </span>
      )
    },
    { 
      header: 'AI Reply', 
      accessor: 'response',
      render: (row) => (
        <span className="truncate max-w-[250px] inline-block cursor-help text-text-muted" title={row.response}>
          {row.response.length > 40 ? `${row.response.substring(0, 40)}...` : row.response}
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
      header: 'Timestamp', 
      accessor: 'timestamp',
      render: (row) => <span className="text-text-muted">{new Date(row.timestamp).toLocaleString()}</span>
    }
  ];

  if (error) return <div className="text-status-danger-text p-6">Failed to load conversations.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card p-4 rounded-lg border border-border">
        <h1 className="text-[20px] font-semibold text-text-primary">Conversations</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-bg-surface border border-border rounded-md text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-border rounded-md text-[13px] text-text-primary hover:bg-bg-hover transition-colors">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={paginatedData} 
        loading={loading}
        emptyMessage={
          <div className="flex flex-col items-center justify-center space-y-3 py-8">
            <MessageSquare className="w-8 h-8 text-text-muted" />
            <p>No conversations yet</p>
          </div>
        }
      />

      {!loading && filteredData.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-[13px] text-text-muted">
            Showing <span className="font-medium text-text-primary">{(page - 1) * limit + 1}</span> to <span className="font-medium text-text-primary">{Math.min(page * limit, filteredData.length)}</span> of <span className="font-medium text-text-primary">{filteredData.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-border text-text-primary hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] text-text-primary font-medium px-2">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md border border-border text-text-primary hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
