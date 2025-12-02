import { Home, Users, History, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Accueil", path: "/dashboard" },
    { icon: Users, label: "Tontines", path: "/tontines" },
    { icon: History, label: "Historique", path: "/history" },
    { icon: Settings, label: "Paramètres", path: "/settings" },
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-medium"
    >
      <div className="flex justify-around items-center px-6 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-smooth"
            >
              <div className={`p-2 rounded-xl transition-smooth ${
                isActive 
                  ? "bg-secondary text-secondary-foreground" 
                  : "text-muted-foreground"
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium transition-smooth ${
                isActive ? "text-secondary" : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default BottomNav;
