// src/components/ui/use-toast.tsx
import * as React from "react"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { type ToastActionElement } from "@/components/ui/toast"

// Tipe toast kita
type Toast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
  className?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const showToast = React.useCallback((props: Omit<Toast, "id">) => {
    const hotToastOptions: any = {
      duration: props.duration || 5000,
      className: props.className,
    }

    if (props.variant === "destructive") {
      hotToastOptions.style = {
        backgroundColor: "var(--destructive)",
        color: "var(--destructive-foreground)",
      }
      hotToastOptions.className = cn(
        hotToastOptions.className,
        "border border-[var(--destructive-border)]"
      )
    }

    return toast.custom((t) => (
      <div
        className={cn(
          // ✅ Hanya pakai GRID seperti toast shadcn
          "group grid relative pointer-events-auto w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-full data-[state=open]:slide-in-from-top-full sm:data-[state=open]:slide-in-from-bottom-full sm:data-[state=closed]:slide-out-to-right-full",
          props.className,
          props.variant === "destructive"
            ? "destructive group border-destructive bg-destructive text-destructive-foreground"
            : "border bg-background text-foreground"
        )}
        data-state={t.visible ? "open" : "closed"}
      >
        <div className="grid gap-1">
          {props.title && <div className="text-sm font-semibold">{props.title}</div>}
          {props.description && (
            <div className="text-sm opacity-90">{props.description}</div>
          )}
        </div>

        {props.action && props.action}

        <button
          onClick={() => toast.dismiss(t.id)}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ), hotToastOptions)
  }, [])

  // Optional: jika kamu tetap ingin simpan daftar toast (tidak wajib)
  const [toasts, setToasts] = React.useState<Toast[]>([])

  return {
    toasts,
    toast: showToast,
  }
}
