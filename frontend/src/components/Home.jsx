import React from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaUpload, FaClipboardList, FaFileAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import styles from './home.module.css';

const features = [
  { icon: <FaChartBar />, title: "Dashboard", description: "Get a quick overview of your inventory status", path: "/" },
  { icon: <FaUpload />, title: "Upload Equipment", description: "Easily add new items to your inventory", path: "/upload-item" },
  { icon: <FaClipboardList />, title: "Manage Equipment", description: "Edit, update, or remove items as needed", path: "/manage-items" },
  { icon: <FaFileAlt />, title: "Generate Report", description: "Create detailed reports of your inventory", path: "/generate-report" },
  { icon: <FaExclamationTriangle />, title: "Low Stock Alerts", description: "View items that are running low in stock", path: "/low-stock-alert" },
];

const FeatureCard = ({ feature, onClick }) => (
  <motion.div
    className={styles.featureCard}
    whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div 
      className={styles.featureIcon}
      whileHover={{ scale: 1.2, rotate: 360 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {feature.icon}
    </motion.div>
    <h3 className={styles.featureTitle}>{feature.title}</h3>
    <p className={styles.featureDescription}>{feature.description}</p>
  </motion.div>
);

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.homeContainer}>
      <div className={styles.plasmaBackground} />
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={styles.heroSection}
      >
        <h2 className={styles.loginTitle}>Campus Sports Sphere</h2>
        <p className={styles.loginSubtitle}>Streamline your Campus Sports Equipment Inventory with Ease and Efficiency</p>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
    
        </motion.p>
      </motion.div>

      <motion.div 
        className={styles.featuresContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            feature={feature}
            onClick={() => navigate(feature.path)}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default Home;