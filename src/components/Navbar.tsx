import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Menu, X, User, Settings, LogOut, Shield, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/generate", label: "Generate" },
    { to: "/chat", label: "AI Chat" },
  ];

  const initials = ((user?.displayName || user?.email || "U") as string).slice(0, 2).toUpperCase();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="mx-auto max-w-6xl clay px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-hero flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            ReadMe<span className="text-gradient">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button variant={location.pathname === link.to ? "default" : "ghost"} size="sm" className="font-body">
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-hero text-primary-foreground text-xs font-bold">{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="clay border-none min-w-[180px]">
                <DropdownMenuItem asChild><Link to="/profile" className="flex items-center gap-2"><User className="h-4 w-4" />Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" />Settings</Link></DropdownMenuItem>
                {isAdmin && <DropdownMenuItem asChild><Link to="/admin" className="flex items-center gap-2"><Shield className="h-4 w-4" />Admin Panel</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-destructive"><LogOut className="h-4 w-4" />Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="hero" size="default" className="gap-2">Sign In</Button>
            </Link>
          )}
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden mt-2 mx-auto max-w-6xl clay p-4 flex flex-col gap-2"
        >
          {links.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
              <Button variant={location.pathname === link.to ? "default" : "ghost"} className="w-full justify-start">{link.label}</Button>
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2"><User className="h-4 w-4" />Profile</Button></Link>
              <Link to="/settings" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2"><Settings className="h-4 w-4" />Settings</Button></Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)}><Button variant="ghost" className="w-full justify-start gap-2"><Shield className="h-4 w-4" />Admin</Button></Link>}
              <Button variant="destructive" className="w-full gap-2 mt-2" onClick={signOut}><LogOut className="h-4 w-4" />Sign Out</Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button variant="hero" className="w-full gap-2 mt-2">Sign In</Button>
            </Link>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
