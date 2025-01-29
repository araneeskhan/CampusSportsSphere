import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi';
import styles from "./LowStockAlert.module.css";

const LowStockAlert = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const stockThreshold = 5;

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = () => {
    setIsLoading(true);
    fetch("http://localhost:5000/all-items")
      .then((res) => res.json())
      .then((data) => {
        const lowStock = data.filter(item => item.itemQuantity < stockThreshold);
        setLowStockItems(lowStock);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        toast.error("Failed to fetch low stock items");
        setIsLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <HiExclamationCircle className={styles.titleIcon} />
        Low Stock Alert
      </h2>
      <div className={styles.controls}>
        <div className={styles.summary}>
          <p>Items below threshold: <strong>{lowStockItems.length}</strong></p>
          <p>Stock threshold: <strong>{stockThreshold}</strong></p>
        </div>
        <button onClick={fetchItems} className={styles.refreshButton}>
          <HiRefresh /> Refresh
        </button>
      </div>
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      ) : lowStockItems.length === 0 ? (
        <p className={styles.noItems}>No items are currently low in stock.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.manageItemsTable}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeadCell}>Item Name</th>
                <th className={styles.tableHeadCell}>Category</th>
                <th className={styles.tableHeadCell}>Current Quantity</th>
                <th className={styles.tableHeadCell}>Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {lowStockItems.map((item) => (
                <tr key={item.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{item.itemName}</td>
                  <td className={styles.tableCell}>{item.category}</td>
                  <td className={`${styles.tableCell} ${styles.quantity}`}>{item.itemQuantity}</td>
                  <td className={styles.tableCell}>{stockThreshold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;