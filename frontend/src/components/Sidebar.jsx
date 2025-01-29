import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaUpload,
  FaList,
  FaChartBar,
  FaBell,
  FaBars,
  FaSignOutAlt,
} from "react-icons/fa";
import styles from "./Sidebar.module.css";

const menuItems = [
  { icon: <FaHome />, name: "Home", path: "/" },
  { icon: <FaUpload />, name: "Upload Item", path: "/upload-item" },
  { icon: <FaList />, name: "Manage Items", path: "/manage-items" },
  { icon: <FaChartBar />, name: "Generate Report", path: "/generate-report" },
  { icon: <FaBell />, name: "Low Stock", path: "/low-stock-alert" },
];

const Sidebar = ({ setIsAuthenticated }) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth > 768);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth > 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <>
      <motion.div
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
        animate={{ width: isOpen ? "250px" : "90px" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className={styles.sidebarContent}>
          {isOpen && (
            <motion.div
              className={styles.logo}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Campus Sports Sphere
            </motion.div>
          )}
          <nav className={styles.nav}>
            {menuItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  to={item.path}
                  className={`${styles.navItem} ${
                    location.pathname === item.path ? styles.active : ""
                  }`}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {isOpen && (
                    <motion.span
                      className={styles.navItemText}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            ))}
          </nav>
          <motion.button
            className={styles.logoutButton}
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={styles.navIcon}>
              <FaSignOutAlt />
            </span>
            {isOpen && (
              <motion.span
                className={styles.navItemText}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.div>
      <motion.button
        className={styles.menuButton}
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FaBars />
      </motion.button>
    </>
  );
};

export default Sidebar;
