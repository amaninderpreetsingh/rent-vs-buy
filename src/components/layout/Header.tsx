import React from "react";
import { HomeIcon, CalculatorIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Header = () => {
  const location = useLocation();
  const headerName = (() => {
    switch (location.pathname) {
      case "/":
        return "Rent vs. Buy Financial Comparison Tool";
      case "/down-payment-calculator":
        return "Down Payment Calculator";
      default:
        return "Rent vs. Buy Calculator"; // Fallback
    }
  })();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <HomeIcon className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold">{headerName}</h1>
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-2">
            <li>
              <Link 
                to="/" 
                className={cn(
                  "px-4 py-2 rounded-md transition-colors flex items-center",
                  isActive("/") 
                    ? "bg-white/20 font-medium" 
                    : "hover:bg-white/10"
                )}
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Rent vs. Buy
              </Link>
            </li>
            <li>
              <Link 
                to="/down-payment-calculator" 
                className={cn(
                  "px-4 py-2 rounded-md transition-colors flex items-center",
                  isActive("/down-payment-calculator") 
                    ? "bg-white/20 font-medium" 
                    : "hover:bg-white/10"
                )}
              >
                <CalculatorIcon className="h-4 w-4 mr-2" />
                Down Payment Calculator
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;