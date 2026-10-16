import Link from "next/link";
import {
  Home,
  CalendarDays,
  CreditCard,
  LayoutGrid,
  User,
} from "lucide-react";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Events", icon: CalendarDays, href: "#" },
  { label: "Bill Pay", icon: CreditCard, href: "#" },
  { label: "MLS", icon: LayoutGrid, href: "#" },
  { label: "Profile", icon: User, href: "#" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-[#1b3a5c]">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-white">
          MIAMI + RWorld
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
