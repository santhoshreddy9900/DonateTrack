# DonateTrack – Donation Drive Inventory Tracker
> A Full-Stack MERN College Assignment Project for Campus Donation Drives & Aid Distribution

DonateTrack is a modern, responsive **MERN (MongoDB, Express.js, React.js, Node.js)** application designed for colleges, student clubs (NSS, Red Cross, Rotaract), and non-profit initiatives to manage charity drives, monitor live warehouse/storeroom inventory, maintain recipient records, and track verified handovers.

---

## 🌟 Key Features

### 1. 📊 Executive Dashboard
- **Total Donations Collected**: Real-time counter of all goods received across campus drives.
- **Total Items Distributed**: Real-time counter of supplies handed over to beneficiaries.
- **Available Inventory**: Automatically calculated remaining balance.
- **Total Registered Recipients**: Count of verified families, shelters, and orphanages.
- **Recent Activities**: Dual live feeds showing latest donations and distribution handovers.
- **Category Inventory Cards**: Visual progress bars displaying fulfillment percentages for each category.

### 2. 🎁 Donation Management
- **Add New Donations**: Record item name, category, quantity, measurement unit (e.g., sets, boxes, pieces, bags), donor name, phone, email, and notes.
- **Full CRUD Support**: View, edit, and delete donation records.
- **Filter & Search**: Instant search by item name, donor name, or email, plus category dropdown filtering.
- **Data Integrity**: Deletion or reduction is prevented if items have already been distributed to recipients.

### 3. 📦 Automated Inventory Management
- **Automated Stock Calculations**:
  $$\text{Remaining Stock} = \sum \text{Donations Collected} - \sum \text{Distributions Made}$$
- **Real-Time Stock Status Badges**:
  - `In Stock` (> 10 items)
  - `Low Stock` (1 – 10 items)
  - `Out of Stock` (0 items)
- **One-Click Distribution**: "Distribute" action directly on inventory rows pre-selects the item with live stock indicators.

### 4. 👥 Recipient Management
- **Beneficiary Directory**: Register recipients, orphanages, homeless shelters, and underserved families.
- **Item Needs Tracking**: Record and tag specific needed items (e.g., *Thermal Blankets, Rice Bags, Notebooks*).
- **Recipient Detail & History Modal**: View complete past distribution history for any selected recipient.
- **Status Tracking**: Categorized as `Active`, `Fulfilled`, or `Pending`.

### 5. 🤝 Distribution Management (With Over-Distribution Prevention)
- **Strict Stock Validation**: The system strictly prevents distributing quantities exceeding available inventory.
- **Live Stock Alerts**: The distribution form dynamically loads current warehouse stock and sets maximum input limits.
- **Automated Stock Deductions**: Instantly updates inventory upon completion.
- **Revert / Cancel Distribution**: Deleting a distribution record immediately restores the items back into inventory balance.

### 6. 📈 Reports & Impact Analytics
- **Visual Analytics**: Interactive Bar Charts and Doughnut Charts powered by `Chart.js` and `react-chartjs-2`.
- **Category Breakdown**: Detailed breakdown of collected vs. distributed vs. remaining stock and fulfillment rate percentage.
- **CSV Data Export**: Export complete category reports to `.csv` for project submission, printing, and grading.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, Lucide React (Icons), Chart.js, React-ChartJS-2, Axios |
| **Backend** | Node.js, Express.js (v5), REST API Architecture |
| **Database** | MongoDB Atlas / Local MongoDB via Mongoose ORM |
| **Styling** | Custom responsive CSS (Blue `#2563eb`, White `#ffffff`, and Light-Grey `#f8fafc` palette) |
| **Environment** | `dotenv` for secret isolation (MongoDB credentials never exposed to client) |

---

## 📁 Project Structure

```
DonateTrack/
├── backend/
│   ├── config/
│   │   └── db.js                 # Resilient MongoDB Atlas / Mongoose connection handler
│   ├── controllers/
│   │   ├── donationController.js     # Donation CRUD & stock integrity checks
│   │   ├── recipientController.js    # Recipient registration & history lookup
│   │   ├── distributionController.js # Distribution logic & strict stock validation
│   │   ├── inventoryController.js    # Live inventory aggregation & calculations
│   │   └── reportController.js       # Dashboard metrics & category reports
│   ├── models/
│   │   ├── Donation.js           # Mongoose Donation schema
│   │   ├── Recipient.js          # Mongoose Recipient schema
│   │   └── Distribution.js       # Mongoose Distribution schema
│   ├── routes/
│   │   ├── donationRoutes.js     # /api/donations endpoints
│   │   ├── recipientRoutes.js    # /api/recipients endpoints
│   │   ├── distributionRoutes.js # /api/distributions endpoints
│   │   ├── inventoryRoutes.js    # /api/inventory endpoints
│   │   └── reportRoutes.js       # /api/reports endpoints
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handler
│   ├── utils/
│   │   └── seedData.js           # College drive sample data & auto-seeder
│   ├── scripts/
│   │   └── seed.js               # Standalone database seed script
│   ├── .env                      # Database credentials & port
│   ├── .env.example              # Template for environment variables
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express application entrypoint
├── frontend/
│   ├── public/                   # Static icons and assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Responsive navigation sidebar
│   │   │   ├── Navbar.jsx        # Topbar with quick actions & mobile menu
│   │   │   ├── StatCard.jsx      # Metric cards with accent borders
│   │   │   ├── Modal.jsx         # Accessible popups for forms & details
│   │   │   ├── Toast.jsx         # Feedback notification toasts
│   │   │   ├── LoadingSpinner.jsx# Polished loading state
│   │   │   └── EmptyState.jsx    # Clean empty list placeholders
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Executive overview & recent activities
│   │   │   ├── Donations.jsx     # Donations list, search, add, edit, delete
│   │   │   ├── Inventory.jsx     # Stock levels, remaining counts, badges
│   │   │   ├── Recipients.jsx    # Recipient directory & history modal
│   │   │   ├── Distributions.jsx # Distribution records & over-distribution checks
│   │   │   └── Reports.jsx       # Chart.js visualizations & CSV export
│   │   ├── services/
│   │   │   └── api.js            # Axios REST client instance
│   │   ├── styles/
│   │   │   ├── index.css         # Design system & color tokens
│   │   │   └── components.css    # Card, table, modal, and responsive styles
│   │   ├── App.jsx               # Main application router & state coordinator
│   │   └── main.jsx              # React DOM mounting
│   ├── index.html                # App title & favicon
│   ├── vite.config.js            # Vite configuration with API proxy
│   └── package.json              # Frontend dependencies
├── package.json                  # Root orchestration scripts
└── README.md                     # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v22+
- **MongoDB Atlas Account** (Free tier at [mongodb.com/atlas](https://www.mongodb.com/atlas)) OR local MongoDB instance.

### 2. Configure Database Credentials
Create or edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/donatetrack?retryWrites=true&w=majority
NODE_ENV=development
```
> **Security Note:** The `.env` file is in the backend directory. The MongoDB credentials are only read by Node.js and are **never** bundled or exposed to frontend code.

### 3. Seed Initial Sample Data (Optional)
To seed realistic college donation drive data (blankets, jackets, study kits, ration bags, registered shelters):
```bash
cd backend
npm run seed
```

### 4. Running the Application

Open two terminal windows:

#### Terminal 1 — Start Backend Server:
```bash
cd backend
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

#### Terminal 2 — Start Frontend:
```bash
cd frontend
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

Or from the root directory:
```bash
npm run server  # Starts backend
npm run client  # Starts frontend
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & MongoDB connection status |
| `GET` | `/api/reports/dashboard` | Dashboard metrics & recent activities |
| `GET` | `/api/reports/category-stats` | Category-wise analytics & fulfillment rates |
| `GET` | `/api/inventory` | Live inventory with calculated remaining stock |
| `GET` | `/api/inventory/summary` | Total collected, distributed & balance inventory |
| `GET` | `/api/inventory/check/:itemName` | Real-time stock check for a specific item |
| `GET` | `/api/donations` | List donations (supports `search`, `category`) |
| `POST` | `/api/donations` | Create a new donation record |
| `PUT` | `/api/donations/:id` | Update donation record (validates stock balance) |
| `DELETE`| `/api/donations/:id` | Delete donation (prevents negative inventory) |
| `GET` | `/api/recipients` | List recipients (supports `search`, `status`) |
| `GET` | `/api/recipients/:id` | Recipient profile with complete distribution history |
| `POST` | `/api/recipients` | Register new recipient |
| `PUT` | `/api/recipients/:id` | Update recipient profile |
| `DELETE`| `/api/recipients/:id` | Delete recipient |
| `GET` | `/api/distributions` | List distribution records |
| `POST` | `/api/distributions` | Distribute item (**enforces stock availability limit**) |
| `DELETE`| `/api/distributions/:id` | Cancel distribution & return quantity to inventory |

---

## 🛡️ Stock Calculation & Inventory Integrity

1. **Strict Prevention of Over-Distribution:**
   When distributing an item, the backend queries the total quantity collected and total quantity distributed across all non-cancelled distributions:
   $$\text{Available Stock} = \sum \text{Quantity}_{\text{Donations}} - \sum \text{Quantity}_{\text{Distributions}}$$
   If the requested quantity > Available Stock, the API rejects the request with HTTP 400:
   ```json
   {
     "success": false,
     "message": "Cannot distribute 50 units of 'Thermal Blankets'. Only 35 units currently available in inventory."
   }
   ```
2. **Dynamic UI Constraints:**
   The frontend automatically binds the `max` attribute of the quantity input field to the live remaining stock and disables submission if stock is zero.
3. **Safety upon Deleting Donations:**
   If a user tries to delete an old donation of 50 units when 40 units have already been distributed to children, the backend prevents deletion with an explanatory message to safeguard inventory consistency.

---

## 🎓 College Assignment Evaluation Checklist

- [x] Full MERN stack architecture with clean separation between `frontend` and `backend`.
- [x] React.js built with modern Vite.
- [x] Node.js and Express.js REST API with modular controllers and routes.
- [x] Mongoose schemas with strict validations for Donations, Recipients, and Distributions.
- [x] Dynamic Dashboard with 4 primary statistic cards and recent activity tables.
- [x] Automated stock calculation & negative inventory prevention.
- [x] Recipient registry with required items and history modal.
- [x] Distribution modal with recipient selection and real-time inventory verification.
- [x] Visual analytical charts with Chart.js and CSV export.
- [x] Professional blue, white, and light-grey theme with responsive sidebar and mobile support.
- [x] Centralized error handling and toast feedback system.
