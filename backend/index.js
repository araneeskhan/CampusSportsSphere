const express = require("express");
const { db } = require("./firebase-config");
const cors = require("cors");
const multer = require("multer");
const {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} = require("firebase/firestore");
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

const app = express();
const port = process.env.PORT || 5000;
const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Port");
});

const sportsCollection = collection(db, "items");

// Insert an item with an image
app.post("/upload-item", upload.single("itemImage"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      const imageRef = ref(storage, `images/${req.file.originalname}`);
      await uploadBytes(imageRef, req.file.buffer);
      const imageUrl = await getDownloadURL(imageRef);
      data.itemImage = imageUrl;
    }
    const result = await addDoc(sportsCollection, data);
    res.send({ id: result.id, ...data });
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET all items from Database
app.get("/all-items", async (req, res) => {
  try {
    const snapshot = await getDocs(sportsCollection);
    const items = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    res.send(items);
  } catch (error) {
    res.status(500).send(error);
  }
});

// GET a specific item by ID
app.get("/item/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const itemDoc = doc(db, "items", id);
    const item = await getDoc(itemDoc);
    if (item.exists()) {
      res.send({ ...item.data(), id: item.id });
    } else {
      res.status(404).send("Item not found");
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE item data
app.patch("/item/:id", upload.single("itemImage"), async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).send("Item ID is missing");
    }
    const updateItemData = req.body;
    const itemDoc = doc(db, "items", id);

    if (req.file) {
      const imageRef = ref(storage, `images/${req.file.originalname}`);
      await uploadBytes(imageRef, req.file.buffer);
      const imageUrl = await getDownloadURL(imageRef);
      updateItemData.itemImage = imageUrl;
    }

    await updateDoc(itemDoc, updateItemData);
    const updatedItem = await getDoc(itemDoc);

    if (!updatedItem.exists()) {
      return res.status(404).send("Item not found");
    }

    res.json(updatedItem.data());
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// DELETE an item
app.delete("/item/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const itemDoc = doc(db, "items", id);
    await deleteDoc(itemDoc);
    res.send("Item deleted successfully");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`App is listening on Port ${port}`);
});
