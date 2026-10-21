# OmniView Sales Intelligence Dashboard

An interactive sales analytics dashboard designed to help users explore sales performance, understand revenue trends, analyze product sales, and identify customer purchasing patterns through data visualization.

## Overview

OmniView Sales Intelligence Dashboard is a web-based application built with React and TypeScript. It transforms transaction data into interactive charts, key performance indicators (KPIs), and detailed transaction records.

The dashboard includes filtering tools, product-level analysis, payment method insights, and transaction management features to make sales data easier to explore and understand.

## Features

- **Sales KPI Metrics:** View total revenue, units sold, unique orders, average order value, and other sales indicators.
- **Revenue Timeline:** Explore revenue and sales trends over time.
- **Product Performance Analysis:** Compare products based on revenue, units sold, and contribution to total sales.
- **Payment Method Analysis:** Understand sales distribution across credit cards, debit cards, eWallets, and cash.
- **Pareto Analysis:** Examine how products contribute to overall revenue.
- **Price and Volume Analysis:** Explore the relationship between product prices and sales volume.
- **Day-of-Week Heatmap:** Analyze sales patterns across different days of the week.
- **Basket Co-occurrence Matrix:** Explore products that appear together in transactions.
- **Transaction Ledger:** Browse and inspect individual sales records.
- **Interactive Filters:** Filter transactions by search query, date range, product, payment method, and price range.
- **Transaction Management:** Add and delete transactions.
- **CSV Import:** Load sales data from a CSV file.
- **Data Export:** Access the dashboard's export interface.
- **Dark Mode:** Switch between light and dark themes.

## Tech Stack

- **Frontend:** React
- **Programming Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** CSS and Tailwind CSS
- **Icons:** Lucide React
- **Animations:** Motion
- **Data Processing:** Custom TypeScript analytics functions
- **Charts and Visualization:** Dashboard-specific chart components

## Project Structure

```text
omniview-sales-intelligence-dashboard/
├── public/
│   └── assets/
│       └── aistudio/
│           └── Sales_data_-_Sheet1_5e94d700.csv
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── KpiMetrics.tsx
│   │   ├── FilterBar.tsx
│   │   ├── RevenueTimelineChart.tsx
│   │   ├── ProductMatrixChart.tsx
│   │   ├── PaymentMethodDonutChart.tsx
│   │   ├── ParetoAnalysisChart.tsx
│   │   ├── PriceVolumeScatterChart.tsx
│   │   ├── DayOfWeekHeatmap.tsx
│   │   ├── BasketCooccurrenceMatrix.tsx
│   │   ├── TransactionLedgerTable.tsx
│   │   ├── AddTransactionModal.tsx
│   │   └── ExportModal.tsx
│   ├── data/
│   │   └── initialData.ts
│   ├── types/
│   │   └── sales.ts
│   ├── utils/
│   │   └── analytics.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

Install the following before running the project:

- Node.js (a current supported LTS version)
- npm
- Visual Studio Code (recommended)

### 1. Clone the repository

Replace `YOUR_USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR_USERNAME/omniview-sales-intelligence-dashboard.git
```

### 2. Open the project

```bash
cd omniview-sales-intelligence-dashboard
```

Open this folder in Visual Studio Code, or run:

```bash
code .
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open the local URL printed in your terminal, usually:

`http://localhost:3000`

Keep the terminal running while you use the dashboard.

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the production application |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs the TypeScript compiler checks |

## How It Works

### 1. Data Loading

The application initializes with predefined sales transactions and attempts to load a CSV file from the public assets directory. If CSV loading fails, the application retains its embedded initial dataset.

### 2. Data Filtering

Users can narrow the displayed transactions using the available search, date, product, payment method, and price filters.

### 3. Analytics Processing

The analytics module processes the filtered transactions to calculate key metrics, product statistics, payment summaries, and sales trends.

### 4. Dashboard Visualization

The resulting statistics are displayed through reusable dashboard components, enabling users to explore different aspects of sales performance.

### 5. Transaction Updates

Users can add transactions, delete individual records, import CSV data, and reset the dashboard to its initial dataset.

## Skills Demonstrated

This project demonstrates practical application of:

- React component-based development
- TypeScript interfaces and type safety
- State management using React Hooks
- Data filtering and aggregation
- KPI calculation and sales analytics
- Interactive dashboard design
- Data visualization
- CSV parsing and data import
- Modular code organization
- Development and production workflows using Vite

## Future Improvements

- Connect a database for persistent transaction storage.
- Add backend APIs for sales data management.
- Implement user authentication and role-based access.
- Add automated tests for analytics calculations.
- Support larger datasets and improved data-processing performance.
- Deploy the application and publish a live demo.

## Author

**Anudev**

Aspiring Generative AI / Agentic AI Engineer with interests in software development, data analytics, and intelligent applications.

GitHub: https://github.com/YOUR_USERNAME

---

*This project is intended for learning, portfolio development, and demonstrating interactive sales analytics capabilities.*
