import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import './index.css'
import App from './App.tsx'
import { SidebarProvider } from "@/components/ui/sidebar"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SidebarProvider> {/* ✅ Bungkus di sini */}
        <App />
      </SidebarProvider>
    </BrowserRouter>
  </React.StrictMode>
)
