import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Conversations from "./pages/Conversations";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Orders from "./pages/Orders";

function Layout() {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/':
      case '/dashboard': return 'Dashboard';
      case '/conversations': return 'Conversations';
      case '/users': return 'Users';
      case '/products': return 'Products';
      case '/orders': return 'Orders';
      default: return 'SupportAI';
    }
  };

  return (
    <div className="flex bg-bg-base min-h-screen text-text-primary">
      <Sidebar />
      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">
        <Header title={getPageTitle()} />
        <main className="p-6 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/users" element={<Users />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;
