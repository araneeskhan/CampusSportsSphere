import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './editItem.module.css';
import { FaUpload, FaImage } from "react-icons/fa";

const EditItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [itemData, setItemData] = useState({
        itemId: '',
        itemName: '',
        itemQuantity: '',
        category: '', 
    });
    const [selectedImage, setSelectedImage] = useState(null);

    const itemCategories = [
        "Football",
        "Cricket",
        "Tennis",
        "Badminton",
        "Volleyball",
        "TableTennis",
        "Basketball",
    ];

    useEffect(() => {
        fetchItem();
    }, []);

    const fetchItem = async () => {
        try {
            const response = await fetch(`http://localhost:5000/item/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch item');
            }
            const data = await response.json();
            setItemData(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch item details');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setItemData({ ...itemData, [name]: value });
    };

    const handleImageChange = (event) => {
        setSelectedImage(event.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updateData = new FormData();
        updateData.append('itemId', itemData.itemId);
        updateData.append('itemName', itemData.itemName);
        updateData.append('itemQuantity', itemData.itemQuantity);
        updateData.append('category', itemData.category);
        if (selectedImage) {
            updateData.append('itemImage', selectedImage);
        }

        try {
            const response = await fetch(`http://localhost:5000/item/${id}`, {
                method: 'PATCH',
                body: updateData,
            });

            if (!response.ok) {
                throw new Error('Failed to update item');
            }

            const data = await response.json();
            console.log('Item updated successfully:', data);
            toast.success('Item updated successfully');
            navigate('/manage-items');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update item');
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.formTitle}>Edit Equipment</h2>
            <form onSubmit={handleSubmit} className={styles.editItemForm}>
                <div className={styles.formGrid}>
                    <div className={styles.inputBox}>
                        <label htmlFor="itemId" className={styles.formLabel}>Item ID</label>
                        <input
                            id="itemId"
                            name="itemId"
                            value={itemData.itemId}
                            onChange={handleChange}
                            required
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <label htmlFor="itemName" className={styles.formLabel}>Item Name</label>
                        <input
                            id="itemName"
                            name="itemName"
                            value={itemData.itemName}
                            onChange={handleChange}
                            required
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <label htmlFor="itemQuantity" className={styles.formLabel}>Item Quantity</label>
                        <input
                            id="itemQuantity"
                            name="itemQuantity"
                            value={itemData.itemQuantity}
                            onChange={handleChange}
                            required
                            className={styles.formInput}
                        />
                    </div>
                    <div className={styles.inputBox}>
                        <label htmlFor="category" className={styles.formLabel}>Item Category</label>
                        <select
                            id="category"
                            name="category"
                            value={itemData.category}
                            onChange={handleChange}
                            required
                            className={styles.formInput}
                        >
                            {itemCategories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className={styles.imageUploadBox}>
                    <label htmlFor="itemImage" className={styles.imageUploadLabel}>
                        <FaImage className={styles.imageIcon} />
                        <span>Choose Image</span>
                    </label>
                    <input
                        type="file"
                        id="itemImage"
                        name="itemImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className={styles.imageInput}
                    />
                    {selectedImage && (
                        <div className={styles.selectedImageName}>{selectedImage.name}</div>
                    )}
                </div>
                <button type="submit" className={styles.submitButton}>
                    <FaUpload className={styles.uploadIcon} />
                    Update Item
                </button>
            </form>
        </div>
    );
};

export default EditItem;