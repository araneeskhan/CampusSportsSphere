import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { getStorage, getFirestore } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import "react-toastify/dist/ReactToastify.css";
import styles from "./uploadItem.module.css";
import { FaUpload, FaImage } from "react-icons/fa";

const UploadItem = () => {
  const itemCategories = [
    "Football",
    "Cricket",
    "Tennis",
    "TableTennis",
    "Badminton",
    "Volleyball",
    "BasketBall",
  ];

  const [selectedItemCategory, setSelectedItemCategory] = useState(
    itemCategories[0]
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [itemId, setItemId] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const navigate = useNavigate();
  const storage = getStorage();
  const db = getFirestore();

  const generateRandomId = () => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };

  useEffect(() => {
    setItemId(generateRandomId());
  }, []);

  const handleChangeSelectedValue = (event) => {
    setSelectedItemCategory(event.target.value);
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageLoading(true);
      try {
        const isValid = await validateImage(file);
        if (!isValid) {
          toast.error(
            "Invalid image. Please upload a valid sports equipment image."
          );
          setSelectedImage(null);
        } else {
          toast.success("Valid sports equipment image detected.");
        }
      } catch (error) {
        console.error("Image recognition failed:", error);
        toast.error("Image recognition failed.");
        setSelectedImage(null);
      } finally {
        setImageLoading(false);
      }
    }
  };

  
  const validateImage = async (file) => {
    const img = new Image();
    const imageURL = URL.createObjectURL(file);
    img.src = imageURL;
  
    return new Promise((resolve, reject) => {
      img.onload = async () => {
        try {
          const model = await mobilenet.load();
          const predictions = await model.classify(img);
  
          const allowedCategories = [
            "cricket ball",
            "cricket bat",
            "football",
            "soccer ball",
            "basketball",
            "badminton",
            "shuttlecock",
            "racket",
            "tennis ball",
            "glove",
            "sports gear",
            "volleyball",
          ];
  
          // Filter predictions with confidence greater than 0.5 (50%)
          const highConfidencePredictions = predictions.filter(
            (prediction) => prediction.probability > 0.5
          );
  
          // Check if any high confidence prediction matches our allowed categories
          const isMatch = highConfidencePredictions.some((prediction) =>
            allowedCategories.some((category) =>
              prediction.className.toLowerCase().includes(category)
            )
          );
  
          if (isMatch) {
            console.log("Matched predictions:", highConfidencePredictions);
          } else {
            console.log("No match found. All predictions:", predictions);
          }
  
          URL.revokeObjectURL(imageURL);
          resolve(isMatch);
        } catch (error) {
          console.error("Error in image validation:", error);
          reject(error);
        }
      };
      img.onerror = reject;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!itemName || !itemQuantity || !itemId || !selectedImage) {
      toast.error("Please fill out all fields and select an image.");
      return;
    }

    if (imageLoading) {
      toast.error("Please wait for image recognition to finish.");
      return;
    }

    try {
      let imageUrl = "";

      if (selectedImage) {
        const imageRef = ref(storage, `images/${selectedImage.name}`);
        await uploadBytes(imageRef, selectedImage);
        imageUrl = await getDownloadURL(imageRef);
        console.log("Image uploaded. URL:", imageUrl);
      }

      await addDoc(collection(db, "items"), {
        itemId,
        itemName,
        itemQuantity: parseInt(itemQuantity, 10),
        category: selectedItemCategory,
        itemImage: imageUrl,
      });

      toast.success("Item uploaded successfully");
      navigate("/manage-items");
    } catch (error) {
      console.error("Error uploading item:", error);
      toast.error("Failed to upload item");
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h2 className={styles.formTitle}>Upload Equipment</h2>
      <form onSubmit={handleSubmit} className={styles.uploadItemForm}>
        <div className={styles.formGrid}>
          <div className={styles.inputBox}>
            <label htmlFor="itemId" className={styles.formLabel}>
              Item ID
            </label>
            <input
              id="itemId"
              name="itemId"
              value={itemId}
              readOnly
              className={styles.formInput}
            />
          </div>
          <div className={styles.inputBox}>
            <label htmlFor="itemName" className={styles.formLabel}>
              Item Name
            </label>
            <input
              id="itemName"
              name="itemName"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.inputBox}>
            <label htmlFor="itemQuantity" className={styles.formLabel}>
              Item Quantity
            </label>
            <input
              id="itemQuantity"
              name="itemQuantity"
              type="number"
              placeholder="Enter item quantity"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(e.target.value)}
              required
              className={styles.formInput}
            />
          </div>
          <div className={styles.inputBox}>
            <label htmlFor="category" className={styles.formLabel}>
              Item Category
            </label>
            <select
              id="category"
              name="category"
              value={selectedItemCategory}
              onChange={handleChangeSelectedValue}
              required
              className={styles.formInput}
            >
              {itemCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
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
        <button
          type="submit"
          className={styles.submitButton}
          disabled={imageLoading}
        >
          {imageLoading ? (
            "Processing Image..."
          ) : (
            <>
              <FaUpload className={styles.uploadIcon} />
              Upload Item
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadItem;