# Inventory Management System

A full-stack Inventory Management System built with **React, Node.js, Express, and PostgreSQL**.

This application enables authenticated employees to manage products, customers, and orders through a secure REST API with JWT authentication and role-based authorization.

---

# Features

### Authentication

* JWT Authentication
* Protected Routes
* Role-based Authorization (Admin / Staff)

### Product Management

* Create Products
* View Product List
* Update Product Information
* Delete Products
* Inventory Quantity Tracking

### Customer Management

* Create Customers
* View Customer List
* Update Customer Information
* Delete Customers

### Order Management

* Create Orders
* Add Multiple Products to a Single Order
* Automatic Order Total Calculation
* Update Order Status
* View Order Details
* Inventory Validation Before Ordering

---

# Tech Stack

## Frontend

* React
* React Router
* CSS

## Backend

* Node.js
* Express.js

## Database

* PostgreSQL

## Authentication

* JSON Web Token (JWT)

## Tools

* Git
* GitHub
* Thunder Client

---

# Project Structure

```text
inventory-management-system/

├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── database/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│
└── README.md
```

---

# Database Tables

* Users
* Products
* Customers
* Orders
* Order Items

---

# REST API

## Authentication

```
POST /login
```

## Products

```
GET    /products
POST   /products
PUT    /products/:id
DELETE /products/:id
```

## Customers

```
GET    /customers
POST   /customers
PUT    /customers/:id
DELETE /customers/:id
```

## Orders

```
GET    /orders
GET    /orders/:id
POST   /orders
PUT    /orders/:id
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
```

## Backend

```bash
cd backend
npm install
npm start
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# Future Improvements

* Deploy backend to AWS EC2
* Deploy PostgreSQL to AWS RDS
* ASP.NET Core version
* Dashboard and Analytics
* Pagination
* Search & Filtering
* Responsive Design Improvements

---

# Author

**Taehyeok Kwon**

GitHub:
https://github.com/tkwon12
