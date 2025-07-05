"use client"

import { useEffect, useState } from "react"
import { Calculator, Users, Package, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { AIInsights } from "@/components/AIInsights"
import { 
  fetchSegmentationData, 
  fetchCrossSellData, 
  fetchSegmentationInsights,
  fetchSimulationProducts,
  simulatePriceChange,
  fetchPriceImpactChart
} from "@/services/api"
import type { SegmentationData, CrossSellData, ProductInsight } from "@/types/product"

// Types for price simulation
interface ProductForSimulation {
  id: string
  name: string
  brand: string
  currentPrice: number
  costPrice: number
  currentSales: number
}

interface PriceSimulationResponse {
  productId: number
  productName: string
  currentPrice: number
  newPrice: number
  currentSales: number
  newSales: number
  currentProfit: number
  newProfit: number
  profitChangePercent: number
  salesChangePercent: number
  elasticity: number
  bundlingRevenue: number
}

interface PriceImpactData {
  priceChangePercent: number
  newPrice: number
  predictedSales: number
  predictedProfit: number
  profitMargin: number
}

export function SegmentationTab() {
  const [filters, setFilters] = useState({
    goal: "all",
    ageRange: "all",
  })

  const [segmentationData, setSegmentationData] = useState<SegmentationData[]>([])
  const [crossSellData, setCrossSellData] = useState<CrossSellData[]>([])
  const [insights, setInsights] = useState<ProductInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Price simulation state
  const [simulationProducts, setSimulationProducts] = useState<ProductForSimulation[]>([])
  const [priceSimulation, setPriceSimulation] = useState({
    selectedProductId: "",
    priceChangePercent: 0,
    bundlingProductId: "",
    bundlingDiscount: 0,
  })
  const [simulationResults, setSimulationResults] = useState<PriceSimulationResponse | null>(null)
  const [priceImpactData, setPriceImpactData] = useState<PriceImpactData[]>([])
  const [simulationLoading, setSimulationLoading] = useState(false)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [segmentationResult, crossSellResult, insightsResult, productsResult] = await Promise.all([
          fetchSegmentationData(filters),
          fetchCrossSellData(),
          fetchSegmentationInsights(filters),
          fetchSimulationProducts(),
        ])

        setSegmentationData(segmentationResult)
        setCrossSellData(crossSellResult)
        setInsights(insightsResult)
        setSimulationProducts(productsResult)

        // Set default product for simulation
        if (productsResult.length > 0) {
          setPriceSimulation(prev => ({
            ...prev,
            selectedProductId: productsResult[0].id
          }))
        }
      } catch (err) {
        console.error("Error loading segmentation data:", err)
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // Load price impact chart when product changes
  useEffect(() => {
    const loadPriceImpactChart = async () => {
      if (priceSimulation.selectedProductId) {
        try {
          const chartData = await fetchPriceImpactChart(Number(priceSimulation.selectedProductId))
          setPriceImpactData(chartData)
        } catch (err) {
          console.error("Error loading price impact chart:", err)
        }
      }
    }

    loadPriceImpactChart()
  }, [priceSimulation.selectedProductId])

  // Run price simulation
  useEffect(() => {
    const runSimulation = async () => {
      if (priceSimulation.selectedProductId && priceSimulation.priceChangePercent !== 0) {
        try {
          setSimulationLoading(true)
          const result = await simulatePriceChange({
            productId: Number(priceSimulation.selectedProductId),
            priceChangePercent: priceSimulation.priceChangePercent,
            bundlingProductId: priceSimulation.bundlingProductId ? Number(priceSimulation.bundlingProductId) : undefined,
            bundlingDiscount: priceSimulation.bundlingDiscount || undefined,
          })
          setSimulationResults(result)
        } catch (err) {
          console.error("Error running price simulation:", err)
        } finally {
          setSimulationLoading(false)
        }
      } else {
        setSimulationResults(null)
      }
    }

    const debounceTimer = setTimeout(runSimulation, 500)
    return () => clearTimeout(debounceTimer)
  }, [priceSimulation])

  // Generate insights based on simulation
  const getSimulationInsights = () => {
    if (!simulationResults) return "Pilih produk dan atur perubahan harga untuk melihat prediksi dampaknya."

    const { priceChangePercent } = priceSimulation
    const { profitChangePercent, salesChangePercent } = simulationResults

    if (priceChangePercent > 0) {
      if (profitChangePercent > 0) {
        return `Menaikkan harga ${priceChangePercent}% akan menurunkan penjualan sebesar ${Math.abs(salesChangePercent).toFixed(1)}%, namun meningkatkan profit sebesar ${profitChangePercent.toFixed(1)}%.`
      } else {
        return `Menaikkan harga ${priceChangePercent}% akan menurunkan penjualan sebesar ${Math.abs(salesChangePercent).toFixed(1)}% dan mengurangi profit sebesar ${Math.abs(profitChangePercent).toFixed(1)}%.`
      }
    } else if (priceChangePercent < 0) {
      return `Memberikan diskon ${Math.abs(priceChangePercent)}% akan meningkatkan penjualan sebesar ${salesChangePercent.toFixed(1)}% dan ${profitChangePercent > 0 ? "meningkatkan" : "mengurangi"} profit sebesar ${Math.abs(profitChangePercent).toFixed(1)}%.`
    }

    return "Tidak ada perubahan harga. Pilih persentase perubahan untuk melihat prediksi dampaknya."
  }

  const bundlingOffers = [
    {
      name: "Muscle Builder Pack",
      products: ["Whey Protein", "Creatine", "Shaker"],
      originalPrice: 750000,
      bundlePrice: 637500,
      discount: 15,
    },
    {
      name: "Fat Burner Combo",
      products: ["L-Carnitine", "Green Tea Extract", "Resistance Band"],
      originalPrice: 520000,
      bundlePrice: 442000,
      discount: 15,
    },
    {
      name: "Recovery Pack",
      products: ["BCAA", "Glutamine", "Foam Roller"],
      originalPrice: 680000,
      bundlePrice: 578000,
      discount: 15,
    },
  ]

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Memuat data segmentasi...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Package className="w-6 h-6 text-red-500 mr-3" />
              <span className="text-red-800 font-semibold text-lg">Error loading segmentation data</span>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Segmentasi & Simulasi</h1>
                <p className="text-gray-600">Analisis pembelian berdasarkan goal dan simulasi dampak perubahan harga</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter Segmentasi:</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Goal</label>
                  <select
                    value={filters.goal}
                    onChange={(e) => setFilters({ ...filters, goal: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">Semua Goal</option>
                    <option value="weight-loss">Weight Loss</option>
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Rentang Usia</label>
                  <select
                    value={filters.ageRange}
                    onChange={(e) => setFilters({ ...filters, ageRange: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="all">Semua Usia</option>
                    <option value="18-25">18-25 tahun</option>
                    <option value="26-35">26-35 tahun</option>
                    <option value="36-45">36-45 tahun</option>
                    <option value="46+">46+ tahun</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Segmentation Chart - Full Width */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Segmentasi Pembelian</h3>
                <p className="text-sm text-gray-500">Pembelian berdasarkan goal dan usia</p>
              </div>
              <div className="text-sm text-gray-500">{segmentationData.length} produk</div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={segmentationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="product" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="weightLoss" stackId="a" fill="#ef4444" name="Weight Loss" />
                  <Bar dataKey="muscleGain" stackId="a" fill="#3b82f6" name="Muscle Gain" />
                  <Bar dataKey="endurance" stackId="a" fill="#10b981" name="Endurance" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Weight Loss</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Muscle Gain</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Endurance</span>
              </div>
            </div>
          </div>

          {/* Price Simulation and Impact Chart - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Price Simulation */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-500" />
                Simulasi Harga
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Simulasikan dampak perubahan harga terhadap penjualan dan profit
              </p>

              <div className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Produk</label>
                  <select
                    value={priceSimulation.selectedProductId}
                    onChange={(e) => setPriceSimulation({ ...priceSimulation, selectedProductId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="">Pilih produk...</option>
                    {simulationProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} {product.brand && `- ${product.brand}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Change Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perubahan Harga ({priceSimulation.priceChangePercent > 0 ? "+" : ""}
                    {priceSimulation.priceChangePercent}%)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={priceSimulation.priceChangePercent}
                      onChange={(e) =>
                        setPriceSimulation({ ...priceSimulation, priceChangePercent: Number(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>-20%</span>
                      <span>0%</span>
                      <span>+20%</span>
                    </div>
                  </div>
                </div>

                {/* Results */}
                {simulationResults && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">Hasil Simulasi:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-blue-600 mb-1">Harga Saat Ini</div>
                        <div className="font-bold text-blue-900">
                          Rp {simulationResults.currentPrice.toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600 mb-1">Harga Baru</div>
                        <div className="font-bold text-blue-900">
                          Rp {Math.round(simulationResults.newPrice).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600 mb-1">Penjualan Saat Ini</div>
                        <div className="font-bold text-blue-900">{simulationResults.currentSales} unit</div>
                      </div>
                      <div>
                        <div className="text-blue-600 mb-1">Penjualan Prediksi</div>
                        <div className="font-bold text-blue-900">{simulationResults.newSales} unit</div>
                      </div>
                      <div>
                        <div className="text-blue-600 mb-1">Profit Saat Ini</div>
                        <div className="font-bold text-blue-900">
                          Rp {Math.round(simulationResults.currentProfit).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600 mb-1">Profit Prediksi</div>
                        <div
                          className={`font-bold ${simulationResults.profitChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          Rp {Math.round(simulationResults.newProfit).toLocaleString("id-ID")} (
                          {simulationResults.profitChangePercent >= 0 ? "+" : ""}
                          {simulationResults.profitChangePercent.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Insight */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-yellow-800 mb-1">Insight:</div>
                      <div className="text-sm text-yellow-700">{getSimulationInsights()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Impact Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Dampak Perubahan Harga</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceImpactData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="priceChangePercent" stroke="#666" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#666" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="predictedSales"
                      stroke="#3b82f6"
                      name="Penjualan (unit)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="predictedProfit"
                      stroke="#10b981"
                      name="Profit"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cross-sell Analysis */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Cross-sell Analysis
              </h3>
              <div className="space-y-3">
                {crossSellData.length > 0 ? (
                  crossSellData.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.baseProduct}</span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {item.confidence}% confidence
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Sering dibeli bersama: <span className="font-medium text-gray-900">{item.relatedProduct}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${item.confidence}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Tidak ada data cross-sell tersedia</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <AIInsights insights={insights} />
            </div>
          </div>

          {/* Bundling Suggestions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Rekomendasi Bundling
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bundlingOffers.map((bundle, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{bundle.name}</h4>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      -{bundle.discount}%
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    {bundle.products.map((product, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        {product}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 line-through">
                        Rp {bundle.originalPrice.toLocaleString("id-ID")}
                      </span>
                      <span className="font-bold text-green-600">Rp {bundle.bundlePrice.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      Hemat Rp {(bundle.originalPrice - bundle.bundlePrice).toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
