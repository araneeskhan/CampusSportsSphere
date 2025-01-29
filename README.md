

# 🌟 **Campus Sports Sphere - Inventory Management (Part 01)** 🌟

## 🎓 **Final Year Project - Inventory Management System for Campus Sports Equipment** 🏅

Welcome to the **Campus Sports Sphere** project! This is the first part of an innovative system designed to streamline the **reservation and management** of sports equipment in university settings. With this app, users can easily **reserve sports equipment** like footballs, tennis rackets, cricket bats, and much more, simplifying the **rental process** for students and faculty alike. 🏆⚽🎾

## 🚀 **Features** 

- **User Registration & Authentication** 🛠️: Users can sign up and log in with ease using **Firebase Authentication**.
- **Equipment Management** 📦: Admins can effortlessly **add, edit, and remove equipment** to manage the inventory.
- **Report Generation** 📊: Admin can generate reports in **PDF** and **CSV** formats.
- **Real-Time Data** ⚡: The app uses **Firebase** as a real-time database, ensuring that the equipment availability is always up-to-date.
- **User-Friendly Dashboard** 💻: A sleek, intuitive interface for **managing reservations** and viewing available items.

## 🛠️ **Tech Stack** 

- **Frontend**: React.js ⚛️
- **Backend**: Node.js 🚀
- **Database**: Firebase 📱
- **Authentication**: Firebase Authentication 🔑

## 📋 **Installation**

### 🔑 **Prerequisites**

Make sure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) 🟢
- [npm](https://www.npmjs.com/) 📦
- A [Firebase account](https://firebase.google.com/) 🔥

### 🏗️ **Setup Steps**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/araneeskhan/CampusSportsSphere
   ```

2. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Set up Firebase Configuration**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Create a new project or use an existing one.
   - Add your **Firebase credentials** (API Key, Auth Domain, etc.) to the `firebaseConfig.js` file.

4. **Start the Development Servers**:
   - In the **Backend folder**:
     ```bash
     node index.js
     ```
   - In the **Frontend folder**:
     ```bash
     npm start
     ```

   Your app will be live at [http://localhost:3000](http://localhost:3000) 🎉

   > **Important:** Don’t forget to set up Firebase credentials in the backend config file to handle server-side operations! 🔑

## 🖥️ **Usage**

- **Admin** can:
  - **Manage the inventory**: Add, edit, and remove items.
  - **Manage reservations**: Admins can view and handle all reservation activities. 

## 🤝 **Contributing**

We welcome contributions to make this project even better! Here's how you can contribute:

1. **Fork** the repository.
2. Create a new **branch**: 
   ```bash
   git checkout -b feature-name
   ```
3. **Make your changes** 💻.
4. **Commit** your changes:
   ```bash
   git commit -m 'Add new feature'
   ```
5. **Push** your changes:
   ```bash
   git push origin feature-name
   ```
6. **Create a pull request** from your fork to the main repository.

---

🙌
