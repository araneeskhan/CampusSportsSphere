import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from 'xlsx';
import styles from "./generateReport.module.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaDownload, FaEdit } from 'react-icons/fa';

const GenerateReport = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("itemName");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editingItem, setEditingItem] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = selectedCategory === "All" 
      ? allItems 
      : allItems.filter(item => item.category === selectedCategory);
    
    const sorted = [...filtered].sort((a, b) => {
      if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredItems(sorted);
  }, [allItems, selectedCategory, sortBy, sortOrder]);

  const fetchItems = () => {
    fetch("http://localhost:5000/all-items")
      .then((res) => res.json())
      .then((data) => {
        setAllItems(data);
        const uniqueCategories = ["All", ...new Set(data.map(item => item.category))];
        setCategories(uniqueCategories);
      })
      .catch((error) => console.error("Error fetching items:", error));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 20, 10);

    const tableColumn = ["Item ID", "Item Name", "Quantity", "Category"];
    const tableRows = filteredItems.map((item) => [
      item.itemId,
      item.itemName,
      item.itemQuantity,
      item.category,
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save("inventory_report.pdf");
  };

  const generateExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredItems);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory_report.xlsx");
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleEdit = (item) => {
    setEditingItem({...item});
  };

  const handleSave = () => {
    const updatedItems = allItems.map(item => 
      item.id === editingItem.id ? editingItem : item
    );
    setAllItems(updatedItems);
    setEditingItem(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingItem({...editingItem, [name]: value});
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Generate Inventory Report</h2>

      <div className={styles.controls}>
        <div className={styles.selectWrapper}>
          <select onChange={handleCategoryChange} className={styles.select}>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className={styles.selectWrapper}>
          <select onChange={handleSortChange} className={styles.select}>
            <option value="itemName-asc">Name (A-Z)</option>
            <option value="itemName-desc">Name (Z-A)</option>
            <option value="itemQuantity-asc">Quantity (Low to High)</option>
            <option value="itemQuantity-desc">Quantity (High to Low)</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={filteredItems}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="itemName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="itemQuantity" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <table className={styles.manageItemsTable}>
        <thead className={styles.tableHead}>
          <tr>
            <th className={styles.tableHeadCell}>Item ID</th>
            <th className={styles.tableHeadCell}>Item Name</th>
            <th className={styles.tableHeadCell}>Item Quantity</th>
            <th className={styles.tableHeadCell}>Category</th>
            <th className={styles.tableHeadCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.map((item) => (
            <tr key={item.id}>
              <td className={styles.tableCell}>{item.itemId}</td>
              <td className={styles.tableCell}>
                {editingItem && editingItem.id === item.id ? 
                  <input name="itemName" value={editingItem.itemName} onChange={handleInputChange} /> :
                  item.itemName
                }
              </td>
              <td className={styles.tableCell}>
                {editingItem && editingItem.id === item.id ? 
                  <input name="itemQuantity" type="number" value={editingItem.itemQuantity} onChange={handleInputChange} /> :
                  item.itemQuantity
                }
              </td>
              <td className={styles.tableCell}>
                {editingItem && editingItem.id === item.id ? 
                  <input name="category" value={editingItem.category} onChange={handleInputChange} /> :
                  item.category
                }
              </td>
              <td className={styles.tableCell}>
                {editingItem && editingItem.id === item.id ? 
                  <button onClick={handleSave} className={styles.actionButton}>Save</button> :
                  <button onClick={() => handleEdit(item)} className={styles.actionButton}>
                    <FaEdit />
                  </button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => setShowExportOptions(!showExportOptions)}
        className={styles.generateButton}
      >
        <FaDownload />
        Download Report
      </button>

      {showExportOptions && (
        <div className={styles.exportOptions}>
          <button onClick={generatePDF} className={styles.exportButton}>Download as PDF</button>
          <button onClick={generateExcel} className={styles.exportButton}>Download as Excel</button>
        </div>
      )}
    </div>
  );
};

export default GenerateReport;