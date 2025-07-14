// src/pages/InventoryDashboard.tsx

import { useEffect, useState } from "react";
import {
  Download,
  FileText,
  AlertCircle,
  Lightbulb,
  Cog, // For maintenance
  Box, // For backup stock
  Replace, // For replacement needed
  Zap, // For active equipment
  Wrench, // For in maintenance
  ShoppingCart, // For AI recommendations
  Filter,
  PackageCheck, // Baik
  PackageX, // Rusak
  PackageMinus, // Dalam Perbaikan
  Package, // Perlu diganti
  LineChart, // For trend
  BarChart2, // For usage
  ClipboardList, // For logs
  Phone,
  Mail,
  MessageCircle,
  CheckCircle, // For Accepted
  Clock, // For Pending
  XCircle, // For Declined
  RotateCcw, // For Deferred
  Tag, // For category
  Truck, // For supplier
  Info, // For AI insight
  DollarSign, // For cost
  Calendar, // For purchase time
  Percent, // For profit margin
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  BarChart,
  Bar,
  Line,
} from "recharts";
import { AppSidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import type {
  InventorySummary,
  EquipmentTableItem,
  InventoryTrends,
  InventoryFilters,
  InventoryDashboardData,
  EquipmentCategory,
  AIInventoryRecommendation,
  AIInventoryRecommendationUpdate,
  Equipment,
} from "@/types/inventory";
import {
  fetchInventoryDashboardData,
  fetchDashboardEquipmentList,
  fetchEquipmentCategories,
  fetchAIRecommendations
} from "@/services/api"; 
import { formatCurrency, formatCompactCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator"; // Import Separator

export default function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [equipmentList, setEquipmentList] = useState<EquipmentTableItem[]>([]);
  const [inventoryTrends, setInventoryTrends] = useState<InventoryTrends | null>(null);
  const [equipmentCategories, setEquipmentCategories] = useState<EquipmentCategory[]>([]);
  const [aiRecommendations, setAIRecommendations] = useState<AIInventoryRecommendation[]>([]);

  const [equipmentFilters, setEquipmentFilters] = useState<InventoryFilters>({});
  const [aiRecFilter, setAiRecFilter] = useState<string>("Pending");

  const [selectedAIRecommendation, setSelectedAIRecommendation] = useState<AIInventoryRecommendation | null>(null);

  const { toast } = useToast();


  const loadDashboardData = async (filters?: InventoryFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchInventoryDashboardData(filters);
      setInventorySummary(data.summary);
      setEquipmentList(data.equipmentList);
      setInventoryTrends(data.trends);
      setEquipmentCategories(data.equipmentCategories);
      
      const initialAI = await fetchAIRecommendations("Pending");
      setAIRecommendations(initialAI);

    } catch (err: any) {
      setError("Failed to load inventory data. Please try again.");
      console.error("Error loading inventory dashboard data:", err);
      toast({
        title: "Error",
        description: "Failed to load inventory data. " + (err.message || String(err)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyEquipmentFilters = async (filters: InventoryFilters) => {
    try {
      setLoading(true);
      setEquipmentFilters(filters);
      const filteredList = await fetchDashboardEquipmentList(filters);
      setEquipmentList(filteredList);
    } catch (err: any) {
      setError("Failed to filter equipment list.");
      console.error("Error filtering equipment list:", err);
      toast({
        title: "Error",
        description: "Failed to filter equipment list. " + (err.message || String(err)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyAIRecommendationFilter = async (decision: string) => {
    try {
      setLoading(true);
      setAiRecFilter(decision);
      const filteredRecommendations = await fetchAIRecommendations(decision);
      setAIRecommendations(filteredRecommendations);
    } catch (err: any) {
      setError("Failed to filter AI recommendations.");
      console.error("Error filtering AI recommendations:", err);
      toast({
        title: "Error",
        description: "Failed to filter AI recommendations. " + (err.message || String(err)),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Baik": return <PackageCheck className="w-5 h-5 text-emerald-500" />;
      case "Rusak": return <PackageX className="w-5 h-5 text-red-500" />;
      case "Dalam Perbaikan": return <PackageMinus className="w-5 h-5 text-blue-500" />;
      case "Perlu Diganti": return <Package className="w-5 h-5 text-yellow-500" />;
      default: return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "Accepted": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "Pending": return <Clock className="w-4 h-4 text-orange-500" />;
      case "Declined": return <XCircle className="w-4 h-4 text-red-500" />;
      case "Deferred": return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case "Replaced from Backup": return <Box className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Helper to clean AI text output
  const cleanAiText = (text?: string | null) => {
    return text ? text.replace(/\*\*/g, '').trim() : 'N/A';
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading inventory data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
        <AppSidebar />
        <main className="ml-0 lg:ml-64 flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => loadDashboardData()}>Try Again</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F7F8FA] font-sans text-gray-800 overflow-hidden">
      <AppSidebar />

      <main className="ml-0 lg:ml-64 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">INVENTARIS</h1>
            <p className="text-gray-600 text-xs lg:text-sm">
              Kelola peralatan gym Anda, pantau status, dan dapatkan rekomendasi AI untuk pengadaan.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 shadow-sm text-xs lg:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </Button>
            <Button
              variant="outline"
              className="border border-gray-300 text-gray-700 font-semibold py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 hover:bg-gray-50 text-xs lg:text-sm bg-transparent"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Data</span>
            </Button>
          </div>
        </header>

        <div className="p-4 lg:p-6 flex-1 overflow-y-auto min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="equipment-list">Daftar Alat</TabsTrigger>
              <TabsTrigger value="ai-recommendations">Rekomendasi AI</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-12 gap-4 lg:gap-6">
                {/* Left & Center Column */}
                <div className="col-span-12 xl:col-span-8 space-y-4 lg:space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-6">
                    <StatCard
                      title="Total Alat Aktif"
                      value={inventorySummary?.total_active_equipment ?? 0}
                      icon={Zap}
                      color="emerald"
                      description="Unit alat dalam kondisi baik"
                    />
                    <StatCard
                      title="Total Alat Rusak"
                      value={inventorySummary?.total_broken_equipment ?? 0}
                      icon={PackageX}
                      color="orange"
                      description="Unit alat perlu perbaikan atau ganti"
                    />
                    <StatCard
                      title="Gudang Cadangan"
                      value={inventorySummary?.total_backup_stock ?? 0}
                      icon={Box}
                      color="blue"
                      description="Unit alat tersedia di gudang"
                    />
                    <StatCard
                      title="Total Perlu Diganti"
                      value={inventorySummary?.total_replacement_needed_equipment ?? 0}
                      icon={Replace}
                      color="purple"
                      description="Unit alat butuh penggantian segera"
                    />
                     <StatCard
                      title="Dalam Perbaikan"
                      value={inventorySummary?.total_in_maintenance_equipment ?? 0}
                      icon={Wrench}
                      color="orange"
                      description="Unit alat sedang diperbaiki"
                    />
                     <StatCard
                      title="Total Nilai Aset"
                      value={formatCompactCurrency(inventorySummary?.total_equipment_value ?? 0)}
                      icon={ShoppingCart}
                      color="emerald"
                      description="Total nilai aset pembelian alat"
                    />
                  </div>

                  {/* Trends Chart */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div>
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900">Tren & Penggunaan Alat</h3>
                        <p className="text-xs lg:text-sm text-gray-500">Jumlah alat rusak per minggu & alat paling sering digunakan</p>
                      </div>
                      <Select defaultValue="all-time">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-time">Sepanjang Waktu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 h-64 lg:h-80">
                      {/* Broken Equipment Trend */}
                      <div className="h-full">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Alat Rusak per Minggu</h4>
                        <ResponsiveContainer width="100%" height="90%">
                          <RechartsLineChart data={inventoryTrends?.broken_equipment_trend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="week" stroke="#666" fontSize={10} />
                            <YAxis stroke="#666" fontSize={10} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                              formatter={(value: any) => [value, "Jumlah Rusak"]}
                            />
                            <Line type="monotone" dataKey="broken_equipment" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Most Used Equipment */}
                      <div className="h-full">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Alat Paling Sering Digunakan</h4>
                        <ResponsiveContainer width="100%" height="90%">
                          <BarChart data={inventoryTrends?.most_used_equipment || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#666" fontSize={10} angle={-45} textAnchor="end" height={50} />
                            <YAxis stroke="#666" fontSize={10} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                              formatter={(value: any) => [value, "Jumlah Penggunaan"]}
                            />
                            <Bar dataKey="usage_count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Recent Status Change Logs */}
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Riwayat Perubahan Status Alat</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Nama Alat</TableHead>
                            <TableHead>Status Lama</TableHead>
                            <TableHead>Status Baru</TableHead>
                            <TableHead>Oleh</TableHead>
                            <TableHead>Alasan</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {inventoryTrends?.recent_status_logs?.map((log) => (
                            <TableRow key={log.log_id}>
                              <TableCell className="text-sm">{new Date(log.change_date).toLocaleDateString()}</TableCell>
                              <TableCell className="text-sm">{log.equipment_name}</TableCell>
                              <TableCell className="text-sm">{log.old_status || 'N/A'}</TableCell>
                              <TableCell className="text-sm">{log.new_status}</TableCell>
                              <TableCell className="text-sm">{log.changed_by}</TableCell>
                              <TableCell className="text-sm">{cleanAiText(log.change_reason)}</TableCell>
                            </TableRow>
                          ))}
                           {(inventoryTrends?.recent_status_logs?.length === 0 || !inventoryTrends?.recent_status_logs) && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                                    No status change logs available.
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                </div>

                {/* Right Sidebar - Latest AI Recommendation */}
                <div className="col-span-12 xl:col-span-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 lg:p-6 rounded-lg shadow-lg text-white sticky top-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">REKOMENDASI AI TERBARU</h3>
                    </div>
                    {inventorySummary?.latest_ai_recommendation ? (
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 space-y-3">
                        <p className="text-xs opacity-80">{new Date(inventorySummary.latest_ai_recommendation.timestamp).toLocaleString()}</p>
                        <h4 className="font-semibold text-lg">{cleanAiText(inventorySummary.latest_ai_recommendation.recommended_equipment_name)}</h4>
                        <p className="text-sm opacity-90 leading-relaxed">{cleanAiText(inventorySummary.latest_ai_recommendation.ai_reasoning)}</p>
                        <div className="text-xs opacity-90 flex flex-col gap-1">
                          <span>Estimasi Harga: {formatCurrency(inventorySummary.latest_ai_recommendation.estimated_cost ?? 0)}</span>
                          <span>Kategori: {cleanAiText(inventorySummary.latest_ai_recommendation.recommended_category?.category_name || 'N/A')}</span>
                          <span>Waktu Pembelian: {cleanAiText(inventorySummary.latest_ai_recommendation.ai_predicted_purchase_time)}</span>
                          <span>Margin Profit Saat Ini: {inventorySummary.latest_ai_recommendation.current_profit_margin_percent?.toFixed(1) ?? 'N/A'}%</span>
                          {inventorySummary.latest_ai_recommendation.trigger_equipment && (
                            <span>Pemicu: {cleanAiText(inventorySummary.latest_ai_recommendation.trigger_equipment.name)} ({cleanAiText(inventorySummary.latest_ai_recommendation.trigger_equipment.status)})</span>
                          )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="secondary"
                              className="w-full text-blue-800 bg-blue-50 hover:bg-blue-100 mt-4"
                              onClick={() => setSelectedAIRecommendation(inventorySummary.latest_ai_recommendation ?? null)}
                            >
                              Lihat Detail Rekomendasi
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px] bg-white text-black">
                            <DialogHeader>
                              <DialogTitle>Detail Rekomendasi AI</DialogTitle>
                              <DialogDescription>
                                Informasi lengkap rekomendasi AI untuk pengadaan/penggantian alat.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedAIRecommendation && (
                              <div className="grid gap-4 py-4 text-sm text-black">
                                <p><strong>Rekomendasi:</strong> {cleanAiText(selectedAIRecommendation.recommended_equipment_name)}</p>
                                <p><strong>Kategori:</strong> {cleanAiText(selectedAIRecommendation.recommended_category?.category_name || 'N/A')}</p>
                                <p><strong>Estimasi Biaya:</strong> {formatCurrency(selectedAIRecommendation.estimated_cost ?? 0)}</p>
                                <p><strong>Alasan AI:</strong> {cleanAiText(selectedAIRecommendation.ai_reasoning)}</p>
                                <p><strong>Waktu Pembelian:</strong> {cleanAiText(selectedAIRecommendation.ai_predicted_purchase_time)}</p>
                                <p><strong>Margin Profit Saat Ini:</strong> {selectedAIRecommendation.current_profit_margin_percent?.toFixed(1) ?? 'N/A'}%</p>
                                {selectedAIRecommendation.trigger_equipment && (
                                    <p><strong>Pemicu:</strong> {cleanAiText(selectedAIRecommendation.trigger_equipment.name)} ({cleanAiText(selectedAIRecommendation.trigger_equipment.status)})</p>
                                )}
                                <p><strong>Keputusan Manajer:</strong> 
                                  <Badge variant="outline" className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold 
                                    ${selectedAIRecommendation.manager_decision === 'Accepted' ? 'bg-emerald-500 text-white' :
                                      selectedAIRecommendation.manager_decision === 'Pending' ? 'bg-orange-500 text-white' :
                                      selectedAIRecommendation.manager_decision === 'Declined' ? 'bg-red-500 text-white' :
                                      'bg-gray-500 text-white'}`}>
                                      {selectedAIRecommendation.manager_decision}
                                  </Badge>
                                </p>
                                {selectedAIRecommendation.notes_manager && (
                                  <p><strong>Catatan Manajer:</strong> {cleanAiText(selectedAIRecommendation.notes_manager)}</p>
                                )}
                                {selectedAIRecommendation.contact_supplier_details && (
                                    <p className="flex items-center gap-2">
                                        <strong>Kontak Supplier:</strong>
                                        {selectedAIRecommendation.contact_supplier_details.includes('whatsapp.com') || selectedAIRecommendation.contact_supplier_details.includes('wa.me') ? (
                                            <a href={selectedAIRecommendation.contact_supplier_details} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" /> WhatsApp
                                            </a>
                                        ) : selectedAIRecommendation.contact_supplier_details.includes('@') ? (
                                            <a href={`mailto:${selectedAIRecommendation.contact_supplier_details}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                <Mail className="w-4 h-4" /> Email
                                            </a>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-4 h-4" /> {cleanAiText(selectedAIRecommendation.contact_supplier_details)}
                                            </span>
                                        )}
                                    </p>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 text-center py-8">
                        <Lightbulb className="w-8 h-8 mx-auto mb-3 opacity-60" />
                        <p className="text-sm opacity-90">Tidak ada rekomendasi AI terbaru.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Equipment List Tab */}
            <TabsContent value="equipment-list" className="space-y-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Daftar Peralatan Inventaris</h3>
                    <p className="text-xs lg:text-sm text-gray-500">Lihat dan kelola semua peralatan gym Anda.</p>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={equipmentFilters.status || "all"}
                      onValueChange={(value) => applyEquipmentFilters({ ...equipmentFilters, status: value === "all" ? undefined : value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="Baik">Baik</SelectItem>
                        <SelectItem value="Rusak">Rusak</SelectItem>
                        <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
                        <SelectItem value="Perlu Diganti">Perlu Diganti</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={equipmentFilters.category_name || "all"}
                      onValueChange={(value) => applyEquipmentFilters({ ...equipmentFilters, category_name: value === "all" ? undefined : value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kategori</SelectItem>
                        {equipmentCategories.map(cat => (
                          <SelectItem key={cat.category_id} value={cat.category_name}>
                            {cat.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-max">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Alat</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Jumlah</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Perawatan Berikutnya</TableHead>
                        <TableHead>Garansi Berakhir</TableHead>
                        <TableHead>Tindakan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {equipmentList.map((item) => (
                        <TableRow key={item.equipment_id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-sm">{item.category_name}</TableCell>
                          <TableCell className="text-sm flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            {item.status}
                          </TableCell>
                          <TableCell className="text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-sm">{item.location}</TableCell>
                          <TableCell className="text-sm">{item.next_maintenance ? new Date(item.next_maintenance).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell className="text-sm">{item.warranty_end ? new Date(item.warranty_end).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="h-8">Detail</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(equipmentList.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                            No equipment found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* AI Recommendations Tab */}
            <TabsContent value="ai-recommendations" className="space-y-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-900">Rekomendasi AI Inventaris</h3>
                    <p className="text-xs lg:text-sm text-gray-500">Tinjau rekomendasi AI untuk pengadaan dan penggantian alat.</p>
                  </div>
                  <Select
                    value={aiRecFilter}
                    onValueChange={applyAIRecommendationFilter}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter Keputusan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Accepted">Diterima</SelectItem>
                      <SelectItem value="Deferred">Ditunda</SelectItem>
                      <SelectItem value="Declined">Ditolak</SelectItem>
                      <SelectItem value="Replaced from Backup">Diganti dari Gudang</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiRecommendations.length > 0 && aiRecommendations.map((rec) => ( /* Map semua rekomendasi di tab ini */
                    <Dialog key={rec.recommendation_id}>
                      <DialogTrigger asChild>
                        <div
                          className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow flex flex-col justify-between"
                          onClick={() => setSelectedAIRecommendation(rec ?? null)}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-base">{cleanAiText(rec.recommended_equipment_name)}</h4>
                              {getDecisionIcon(rec.manager_decision)}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">{cleanAiText(rec.ai_predicted_purchase_time)} - {cleanAiText(rec.recommended_category?.category_name || 'N/A')}</p>
                            <p className="text-sm text-gray-700 mb-2 line-clamp-3">{cleanAiText(rec.ai_reasoning)}</p>
                            <div className="text-xs text-gray-500">
                              <p>Harga Estimasi: {formatCurrency(rec.estimated_cost ?? 0)}</p>
                              <p>Margin Profit: {rec.current_profit_margin_percent?.toFixed(1) ?? 'N/A'}%</p>
                              {rec.trigger_equipment && <p>Pemicu: {cleanAiText(rec.trigger_equipment.name)} ({cleanAiText(rec.trigger_equipment.status)})</p>}
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <Badge variant="outline" className={`text-xs ${
                                rec.manager_decision === 'Pending' ? 'border-orange-300 text-orange-700' :
                                rec.manager_decision === 'Accepted' ? 'border-emerald-300 text-emerald-700' :
                                'border-gray-300 text-gray-700'
                            }`}>
                                {rec.manager_decision}
                            </Badge>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Detail Rekomendasi AI</DialogTitle>
                          <DialogDescription>
                            Informasi lengkap rekomendasi AI untuk pengadaan/penggantian alat.
                          </DialogDescription>
                        </DialogHeader>
                        {selectedAIRecommendation && (
                          <div className="grid gap-4 py-4 text-sm">
                            {/* Bagian Rekomendasi */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Package className="w-4 h-4 text-gray-600" />
                                    <h5 className="font-semibold text-gray-800">Rekomendasi</h5>
                                </div>
                                <p><strong className="text-gray-700">Nama Alat:</strong> {cleanAiText(selectedAIRecommendation.recommended_equipment_name)}</p>
                                <p><strong className="text-gray-700">Kategori:</strong> {cleanAiText(selectedAIRecommendation.recommended_category?.category_name || 'N/A')}</p>
                                <p><strong className="text-gray-700">Estimasi Biaya:</strong> {formatCurrency(selectedAIRecommendation.estimated_cost ?? 0)}</p>
                                <p><strong className="text-gray-700">Waktu Pembelian:</strong> {cleanAiText(selectedAIRecommendation.ai_predicted_purchase_time)}</p>
                                <p><strong className="text-gray-700">Margin Profit Saat Ini:</strong> {selectedAIRecommendation.current_profit_margin_percent?.toFixed(1) ?? 'N/A'}%</p>
                            </div>
                            <Separator /> {/* Pemisah */}

                            {/* Bagian Detail Alat Pemicu (jika ada) */}
                            {selectedAIRecommendation.trigger_equipment && (
                                <>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Wrench className="w-4 h-4 text-gray-600" />
                                            <h5 className="font-semibold text-gray-800">Detail Alat Pemicu</h5>
                                        </div>
                                        <p><strong className="text-gray-700">Nama Alat:</strong> {cleanAiText(selectedAIRecommendation.trigger_equipment.name)}</p>
                                        <p><strong className="text-gray-700">Status:</strong> {cleanAiText(selectedAIRecommendation.trigger_equipment.status)}</p>
                                        <p><strong className="text-gray-700">Lokasi:</strong> {cleanAiText(selectedAIRecommendation.trigger_equipment.location)}</p>
                                        {selectedAIRecommendation.trigger_equipment.serial_number && <p><strong className="text-gray-700">No. Seri:</strong> {cleanAiText(selectedAIRecommendation.trigger_equipment.serial_number)}</p>}
                                        {selectedAIRecommendation.trigger_equipment.purchase_date && <p><strong className="text-gray-700">Tgl Beli:</strong> {new Date(selectedAIRecommendation.trigger_equipment.purchase_date).toLocaleDateString()}</p>}
                                    </div>
                                    <Separator /> {/* Pemisah */}
                                </>
                            )}
                            
                            {/* Bagian Insight AI Tambahan */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Lightbulb className="w-4 h-4 text-gray-600" />
                                    <h5 className="font-semibold text-gray-800">Insight AI</h5>
                                </div>
                                <p><strong className="text-gray-700">Alasan AI:</strong> {cleanAiText(selectedAIRecommendation.ai_reasoning)}</p>
                            </div>
                            <Separator /> {/* Pemisah */}

                            {/* Bagian Keputusan & Catatan Manajer */}
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <ClipboardList className="w-4 h-4 text-gray-600" />
                                    <h5 className="font-semibold text-gray-800">Keputusan Manajer</h5>
                                </div>
                                <p>
                                    <strong className="text-gray-700">Status:</strong> 
                                    <Badge variant="outline" className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold 
                                        ${selectedAIRecommendation.manager_decision === 'Accepted' ? 'bg-emerald-500 text-white' :
                                          selectedAIRecommendation.manager_decision === 'Pending' ? 'bg-orange-500 text-white' :
                                          selectedAIRecommendation.manager_decision === 'Declined' ? 'bg-red-500 text-white' :
                                          'bg-gray-500 text-white'}`}>
                                        {selectedAIRecommendation.manager_decision}
                                    </Badge>
                                </p>
                                {selectedAIRecommendation.decision_date && <p><strong className="text-gray-700">Tgl Keputusan:</strong> {new Date(selectedAIRecommendation.decision_date).toLocaleDateString()}</p>}
                                {selectedAIRecommendation.notes_manager && (
                                  <p><strong className="text-gray-700">Catatan:</strong> {cleanAiText(selectedAIRecommendation.notes_manager)}</p>
                                )}
                            </div>
                            <Separator /> {/* Pemisah */}

                            {/* Bagian Kontak Supplier */}
                            {selectedAIRecommendation.contact_supplier_details && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Truck className="w-4 h-4 text-gray-600" />
                                        <h5 className="font-semibold text-gray-800">Kontak Supplier</h5>
                                    </div>
                                    <p className="flex items-center gap-2">
                                        {selectedAIRecommendation.contact_supplier_details.includes('whatsapp.com') || selectedAIRecommendation.contact_supplier_details.includes('wa.me') ? (
                                            <a href={selectedAIRecommendation.contact_supplier_details} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" /> WhatsApp
                                            </a>
                                        ) : selectedAIRecommendation.contact_supplier_details.includes('@') ? (
                                            <a href={`mailto:${selectedAIRecommendation.contact_supplier_details}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                <Mail className="w-4 h-4" /> Email
                                            </a>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <Phone className="w-4 h-4" /> {cleanAiText(selectedAIRecommendation.contact_supplier_details)}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  ))}
                  {(aiRecommendations.length === 0) && (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      Tidak ada rekomendasi AI dalam status ini.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}