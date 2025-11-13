#  Travel and Tour Management System

A **full-stack web platform** that allows users to explore travel packages, create itineraries, make bookings, and complete secure payments — all while admins manage tours, users, and bookings through a dedicated dashboard.

---

## Setup and Usage Guide

### 1. Clone the Repository
```bash
git clone https://github.com/HarshaVardhan31012007/oops_project
cd travel-tour-management
```

---

### 2. Install Dependencies
Install both frontend and backend dependencies in one go:
```bash
npm run install-all
```
If unavailable, install manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

### 3. Configure Environment Variables

#### Backend `.env`
Create a `.env` file in the **backend/** folder:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/travel-tour-system

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRE=7d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

#### Frontend `.env` (optional)
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

---

### 4. Seed the Database (Optional)
If your project includes sample data:
```bash
cd backend
node scripts/seed.js
```

---

###  5. Run the Application

#### Option 1 — Start both frontend & backend
```bash
npm run dev
```

#### Option 2 — Run separately
```bash
# Terminal 1
cd backend
npm run server

# Terminal 2
cd frontend
npm start
```

---

###  6. Access the Application
- **Frontend** → http://localhost:3000  
- **Backend API** → http://localhost:5000  
- **API Docs (if enabled)** → http://localhost:5000/api-docs  

---

##  Using the Application

###  For Users
- Sign up or log in securely.  
- Browse and filter travel tours.  
- View tour details and create itineraries.  
- Book tours and complete payments.  
- Manage bookings and view reward points.

---

##  Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

##  Deployment

###  Backend (Render / Heroku)
1. Connect your GitHub repository.  
2. Add all environment variables in project settings.  
3. Deploy automatically on push.

###  Frontend (Vercel / Netlify)
1. Connect the repository.  
2. Build command → `npm run build`  
3. Output directory → `build`  
4. Deploy.

---

##  Tech Stack

**Frontend:** React 18, Redux Toolkit, Tailwind CSS, React Router, Framer Motion  
**Backend:** Node.js, Express.js, MongoDB, Mongoose  
**Authentication:** JWT + bcrypt  
**Payments:** Stripe / Razorpay  
**Email & Media:** Nodemailer, Cloudinary  

---

##  Contributing
1. Fork the repository  
2. Create your feature branch → `git checkout -b feature/amazing-feature`  
3. Commit your changes → `git commit -m "Add amazing feature"`  
4. Push to branch → `git push origin feature/amazing-feature`  
5. Open a Pull Request  

---

##  License
This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.  

---

## Repository
[GitHub Repository – Travel and Tour Management System](https://github.com/HarshaVardhan31012007/oops_project)

---
