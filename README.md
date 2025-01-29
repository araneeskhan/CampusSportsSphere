Campus Sports Sphere - Inventory Management (Part 01)

Final Year Project - Inventory Management System for Campus Sports Equipment

This is the first part of the Campus Sports Sphere project, designed to streamline the reservation and management of sports equipment in university settings. The system allows users to reserve sports equipment such as footballs, tennis rackets, cricket bats, etc., simplifying the equipment rental process for students and faculty.

Features
•	User Registration & Authentication: Users can sign up and log in using Firebase Authentication.
•	Equipment Management: Admin users can manage the inventory by adding, editing, or removing equipment.
•	Report Generation: Admin can generate Reports in PDF and CSV Form.
•	Real-Time Data: The application uses Firebase as a real-time database, ensuring that the equipment availability is always up-to-date.
•	Dashboard: A user-friendly interface for managing reservations and viewing available items.

Tech Stack
•	Frontend: React.js
•	Backend: Node.js
•	Database: Firebase
•	Authentication: Firebase Authentication

Installation
  Prerequisites
Ensure that you have the following installed:
•	Node.js
•	npm
•	Firebase account

1.	Clone the repository:
2.	git clone araneeskhan/CampusSportsSphere: FYP Part 1 (Web) - "Campus Sports Sphere"
3.	Install dependencies:
4.	cd backend 
5.	npm install
6.	cd frontend
7.	npm install
8.	Set up Firebase configuration in firebaseConfig.js:
o	Go to Firebase Console.
o	Create a new project or use an existing one.
o	Add Firebase credentials (API Key, Auth Domain, etc.) to the firebaseConfig.js file.

9.	Start the development server:
10.	At the Backend file type “node Index.js”
11.	In the Frontend File type “npm start”

Your app will be running at http://localhost:3000.

1.	Don’t fotger to Set up Firebase credentials in the backend config file (for server-side operations).
Usage

•	Admin: Can manage the inventory by adding, editing, and deleting items. They can also manage user reservations.

Contributing
1.	Fork the repository.
2.	Create a new branch (git checkout -b feature-name).
3.	Make your changes.
4.	Commit your changes (git commit -m 'Add new feature').
5.	Push to the branch (git push origin feature-name).
6.	Create a pull request.
