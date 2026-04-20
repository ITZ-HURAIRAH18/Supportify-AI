import { useState } from "react";
import DataTable from "../components/DataTable";
import Badge from "../components/Badge";
import { useFetch } from "../hooks/useFetch";
import { getOrders } from "../api";

export default function Orders() {
  const { data: orders, loading, error } = useFetch(() => getOrders(0, 100));
  const [activeTab, setActiveTab] = useState("All");

  const tabs = ["All", "Pending", "Completed", "Cancelled"];

  const filteredOrders = orders?.filter(order => {
    if (activeTab === "All") return true;
    return order.status.toLowerCase() === activeTab.toLowerCase();
  }) || [];

  const columns = [
    { 
      header: 'Order ID', 
      accessor: 'id',
      render: (row) => <span className="font-semibold text-text-primary">#{row.id}</span>
    },
    { 
      header: 'User', 
      accessor: 'user_id',
      render: (row) => <span className="text-text-muted">#{row.user_id}</span>
    },
    { 
      header: 'Amount', 
      accessor: 'amount',
      render: (row) => <span className="text-accent font-medium">Rs. {row.amount.toLocaleString()}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => {
        let variant = 'gray';
        const status = row.status.toLowerCase();
        if (status === 'pending') variant = 'warning';
        if (status === 'completed' || status === 'delivered') variant = 'success';
        if (status === 'cancelled') variant = 'danger';
        return <Badge label={row.status} variant={variant} />;
      }
    },
    { 
      header: 'Date', 
      accessor: 'created_at',
      render: (row) => <span className="text-text-muted">{new Date(row.created_at).toLocaleDateString()}</span>
    },
    { 
      header: 'Actions', 
      accessor: 'actions',
      render: () => (
        <button className="px-3 py-1.5 border border-border rounded-md text-[12px] font-medium text-text-primary hover:bg-bg-hover hover:border-[#3A3A3A] transition-colors">
          View
        </button>
      )
    }
  ];

  if (error) return <div className="text-status-danger-text p-6">Failed to load orders.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-bg-card p-4 rounded-lg border border-border">
        <h1 className="text-[20px] font-semibold text-text-primary">Orders</h1>
        
        <div className="flex p-1 bg-bg-surface rounded-md border border-border">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded transition-colors ${
                activeTab === tab 
                  ? "bg-bg-hover text-text-primary shadow-sm" 
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={filteredOrders} 
        loading={loading}
        emptyMessage={`No ${activeTab === "All" ? "" : activeTab.toLowerCase()} orders found.`}
      />
    </div>
  );
}
