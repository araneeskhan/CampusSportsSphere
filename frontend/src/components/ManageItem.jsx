import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./manageItem.module.css";
import { FaSearch, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ManageItems = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("query") || "");
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const itemsPerPage = 10; 

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const filtered = allItems.filter(item =>
      item.itemName.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [search, allItems]);

  const fetchItems = () => {
    fetch("http://localhost:5000/all-items")
      .then((res) => res.json())
      .then((data) => {
        setAllItems(data);
        setFilteredItems(data);
      })
      .catch((error) => console.error("Error fetching items:", error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:5000/item/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Item deleted successfully");
          setAllItems((prevItems) =>
            prevItems.filter((item) => item.id !== id)
          );
        } else {
          throw new Error("Failed to delete item");
        }
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        toast.error("Failed to delete item");
      });
  };

  const handleEdit = (id) => {
    navigate(`/edit-item/${id}`);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const onPrevPageHandler = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const onNextPageHandler = () => {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const onChangeHandler = (e) => {
    setSearch(e.target.value);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage Equipments</h2>
      <form onSubmit={onSubmitHandler} className={styles.searchForm}>
        <div className={styles.searchInputWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            value={search} 
            onChange={onChangeHandler} 
            placeholder="Search items by name" 
            className={styles.searchInput}
          />
        </div>
        <button type="submit" className={styles.searchButton}>Search</button>
      </form>
    
      <div className={styles.tableWrapper}>
        <table className={styles.manageItemsTable}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeadCell}>Item ID</th>
              <th className={styles.tableHeadCell}>Item Name</th>
              <th className={styles.tableHeadCell}>Quantity</th>
              <th className={styles.tableHeadCell}>Category</th>
              <th className={styles.tableHeadCell}>Image</th>
              <th className={styles.tableHeadCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{item.itemId}</td>
                <td className={styles.tableCell}>{item.itemName}</td>
                <td className={styles.tableCell}>{item.itemQuantity}</td>
                <td className={styles.tableCell}>{item.category}</td>
                <td className={styles.tableCell}>
                  <img
                    src={item.itemImage}
                    alt={item.itemName}
                    className={styles.itemImage}
                  />
                </td>
                <td className={styles.tableCell}>
                  <button
                    onClick={() => handleEdit(item.id)}
                    className={`${styles.actionButton} ${styles.editButton}`}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={`${styles.actionButton} ${styles.deleteButton}`}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      <div className={styles.paginationButtons}>
        <button onClick={onPrevPageHandler} className={styles.pageButton} disabled={currentPage === 1}>
          <FaChevronLeft />
        </button>
        <span className={styles.pageIndicator}>{currentPage}</span>
        <button onClick={onNextPageHandler} className={styles.pageButton} disabled={currentPage === Math.ceil(filteredItems.length / itemsPerPage)}>
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ManageItems;