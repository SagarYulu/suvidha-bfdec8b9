
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  AlertCircle, 
  BarChart3, 
  Settings, 
  UserCheck,
  MessageSquare,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Issues", href: "/admin/issues", icon: AlertCircle },
  { name: "Assigned Issues", href: "/admin/assigned-issues", icon: UserCheck },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Feedback Analytics", href: "/admin/feedback-analytics", icon: MessageSquare },
  { name: "Sentiment Analysis", href: "/admin/sentiment-analysis", icon: BrainCircuit },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        location.pathname === item.href
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50",
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      )}
                    >
                      <item.icon
                        className={cn(
                          location.pathname === item.href
                            ? "text-blue-600"
                            : "text-gray-400 group-hover:text-blue-600",
                          "h-6 w-6 shrink-0"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
