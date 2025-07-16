import {
  Home,
  Users,
  UserCheck,
  ShoppingCart,
  PieChartIcon as ChartPieIcon,
  HomeIcon,
  CircleEllipsisIcon as ChatBubbleOvalLeftEllipsisIcon,
  ArchiveIcon as ArchiveBoxIcon,
  BanknoteIcon as BanknotesIcon,
  SparklesIcon,
  CogIcon as Cog6ToothIcon,
  ArrowRightIcon as ArrowRightOnRectangleIcon,
  Brain, // Added Brain import
} from "lucide-react"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: HomeIcon },
  { title: "Member", url: "/member", icon: Users, active: true },
  { title: "Trainer", url: "/trainer", icon: UserCheck },
  { title: "Feedback & Sentiment", url: "/feedback", icon: ChatBubbleOvalLeftEllipsisIcon },
  { title: "Inventory", url: "/inventory", icon: ArchiveBoxIcon },
  { title: "Product & Supplement", url: "/products", icon: ShoppingCart },
  { title: "Finance", url: "/finance", icon: BanknotesIcon },
  { title: "GymTrack AI", url: "/ai", icon: SparklesIcon }, //AI Menu
]

const generalItems = [
  { title: "Settings", url: "/settings", icon: Cog6ToothIcon },
  { title: "Logout", url: "/logout", icon: ArrowRightOnRectangleIcon },
]

export function AppSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-20 flex flex-col transform -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <ChartPieIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">GymTrack</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">MENU</p>
        {menuItems.map((item) => (
          <a
            key={item.title}
            href={item.url}
            className={`flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
              item.active
                ? "font-semibold bg-blue-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-gray-200">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">GENERAL</p>
        {generalItems.map((item) => (
          <a
            key={item.title}
            href={item.url}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </aside>
  )
}