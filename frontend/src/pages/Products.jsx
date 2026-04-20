import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import Skeleton from "../components/Skeleton";
import { useFetch } from "../hooks/useFetch";
import { getProducts, createProduct } from "../api";

export default function Products() {
  const { data: products, loading, error, refetch } = useFetch(() => getProducts(0, 100));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", price: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.description) return;
    
    try {
      setSubmitting(true);
      await createProduct({
        ...formData,
        price: parseFloat(formData.price)
      });
      setFormData({ name: "", price: "", description: "" });
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <div className="text-status-danger-text p-6">Failed to load products.</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-bg-card p-4 rounded-lg border border-border">
        <h1 className="text-[20px] font-semibold text-text-primary">Products</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-text-inverse px-4 py-2 rounded-md font-medium text-[13px] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add product
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border p-5 rounded-[12px]"><Skeleton rows={3} /></div>
          <div className="bg-bg-card border border-border p-5 rounded-[12px]"><Skeleton rows={3} /></div>
          <div className="bg-bg-card border border-border p-5 rounded-[12px]"><Skeleton rows={3} /></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <div key={product.id} className="bg-bg-card border border-border rounded-[12px] p-5 flex flex-col justify-between hover:border-border-hover transition-colors group">
              <div>
                <h3 className="text-[16px] font-semibold text-text-primary mb-1">{product.name}</h3>
                <div className="text-[24px] font-bold text-accent mb-3">
                  Rs. {product.price.toLocaleString()}
                </div>
                <p className="text-[13px] text-text-muted line-clamp-2 min-h-[40px]">
                  {product.description}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                <button className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-hover rounded-md transition-colors flex-1 flex justify-center">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-text-muted hover:text-status-danger-text hover:bg-status-danger-bg rounded-md transition-colors flex-1 flex justify-center">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {products?.length === 0 && (
            <div className="col-span-full py-16 text-center text-text-muted bg-bg-card rounded-[12px] border border-border">
              No products found
            </div>
          )}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1">Product Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_#7C3A0A] transition-shadow"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1">Price (Rs.)</label>
            <input 
              type="number" 
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_#7C3A0A] transition-shadow"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1">Description</label>
            <textarea 
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-bg-surface border border-border rounded-md px-3 py-2 text-[14px] text-text-primary resize-none focus:outline-none focus:border-transparent focus:shadow-[0_0_0_2px_#7C3A0A] transition-shadow"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-border rounded-md text-[13px] font-medium text-text-primary hover:bg-bg-hover transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-text-inverse rounded-md text-[13px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
