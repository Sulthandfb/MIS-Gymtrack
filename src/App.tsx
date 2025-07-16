// src/App.tsx
import { Routes, Route, useParams } from "react-router-dom";
import MemberDashboard from "@/pages/MemberDashboard";
import TrainerDashboard from "@/pages/TrainerDashboard";
import TrainerDetail from "@/pages/TrainerDetail";
import ProductsDashboard from "@/pages/ProductDashboard";
import FinanceDashboard from "@/pages/FinanceDashboard"; // Pastikan ini diimpor jika ada
import ProtectedRoute from "@/components/protected-route"; // Pastikan ProtectedRoute diimpor
import InventoryDashboard from './pages/InventoryDashboard';
import FeedbackDashboard from './pages/FeedbackDashboard';
import Chatbot from '@/pages/Chatbot'; // Import Chatbot component

// Komponen pembantu untuk meneruskan trainerId ke TrainerDetail
const TrainerDetailWrapper = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  return <TrainerDetail trainerId={trainerId || ""} />;
};

function App() {
  return (
    <main className="min-h-screen bg-gray-100">
      {/* Gunakan ProtectedRoute untuk melindungi rute yang memerlukan autentikasi */}
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<MemberDashboard />} />
          <Route path="/dashboard" element={<MemberDashboard />} /> {/* Sesuaikan jika ada rute dashboard terpisah */}
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/trainer" element={<TrainerDashboard />} />
          <Route path="/trainer/:trainerId" element={<TrainerDetailWrapper />} />
          <Route path="/products" element={<ProductsDashboard />} />
          <Route path="/finance" element={<FinanceDashboard />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/feedback" element={<FeedbackDashboard />} />
          <Route path="/ai" element={<Chatbot />} />
          {/* Tambahkan rute lain yang Anda miliki */}
          {/* Contoh: <Route path="/products" element={<ProductsPage />} /> */}
          {/* Pastikan semua rute yang ada di sidebar sudah didefinisikan di sini */}
        </Routes>
      </ProtectedRoute>
    </main>
  );
}

export default App;