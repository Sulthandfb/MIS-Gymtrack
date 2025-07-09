"use client"

import { useState } from "react"
import { FileText, Download, Filter } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"

export function FinanceReportsTab() {
  const [reportType, setReportType] = useState("monthly")
  const [period, setPeriod] = useState("12months")
  const [dateRange, setDateRange] = useState<any>(null)

  // Available reports
  const reports = [
    {
      id: "profit-loss",
      title: "Laporan Laba Rugi",
      description: "Ringkasan pendapatan, pengeluaran, dan profit",
      icon: "📊",
    },
    {
      id: "cash-flow",
      title: "Laporan Arus Kas",
      description: "Analisis cash flow masuk dan keluar",
      icon: "💰",
    },
    {
      id: "budget-variance",
      title: "Laporan Variance Budget",
      description: "Perbandingan budget vs aktual",
      icon: "📈",
    },
    {
      id: "financial-targets",
      title: "Laporan Pencapaian Target",
      description: "Progress pencapaian target keuangan",
      icon: "🎯",
    },
    {
      id: "payment-analysis",
      title: "Analisis Metode Pembayaran",
      description: "Distribusi dan tren metode pembayaran",
      icon: "💳",
    },
    {
      id: "comprehensive",
      title: "Laporan Komprehensif",
      description: "Laporan lengkap semua aspek keuangan",
      icon: "📋",
    },
  ]

  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId}`)
    // Implement report generation logic
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
            <p className="text-gray-600">Generate dan download laporan keuangan dalam berbagai format</p>
          </div>
        </div>
      </div>

      {/* Report Filters */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            Filter Laporan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Laporan</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe laporan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="quarterly">Kuartalan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Periode</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1month">1 Bulan Terakhir</SelectItem>
                  <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                  <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
                  <SelectItem value="12months">12 Bulan Terakhir</SelectItem>
                  <SelectItem value="ytd">Tahun Berjalan</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format Export</label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue placeholder="Pilih format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {period === "custom" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Date Range</label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{report.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="text-sm">{report.description}</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button onClick={() => handleGenerateReport(report.id)} className="flex-1" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={() => handleGenerateReport(report.id)} variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle>Laporan Terbaru</CardTitle>
          <CardDescription>Laporan yang baru saja di-generate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Laporan Laba Rugi - Desember 2024",
                date: "15 Jan 2025",
                size: "2.3 MB",
                format: "PDF",
              },
              {
                name: "Analisis Cash Flow - Q4 2024",
                date: "10 Jan 2025",
                size: "1.8 MB",
                format: "Excel",
              },
              {
                name: "Laporan Komprehensif - 2024",
                date: "5 Jan 2025",
                size: "5.2 MB",
                format: "PDF",
              },
            ].map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{report.name}</p>
                    <p className="text-sm text-gray-500">
                      {report.date} • {report.size} • {report.format}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
