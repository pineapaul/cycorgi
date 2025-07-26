# Cycorgi - Cybersecurity Risk Management Platform

A comprehensive cybersecurity risk management and compliance platform built with Next.js, designed to help organisations manage information assets, conduct risk assessments, and maintain regulatory compliance.

## Overview

Cycorgi provides a modern, intuitive interface for managing cybersecurity risks and information assets. The platform features a dashboard with key metrics, detailed asset management, and compliance tracking capabilities.

## Features

### 🛡️ Risk Management
- **Risk Assessment**: Comprehensive risk evaluation and tracking
- **Risk Metrics**: Real-time dashboard with key performance indicators
- **Risk Reporting**: Export and generate detailed risk reports

### 📊 Information Asset Management
- **Asset Inventory**: Complete information asset registry
- **CIA Assessments**: Confidentiality, Integrity, and Availability evaluations
- **Asset Classification**: Categorise assets by type, sensitivity, and criticality
- **Data Export**: CSV export functionality for asset data

### 🎯 Compliance & Auditing
- **Compliance Tracking**: Monitor regulatory compliance scores
- **Audit Management**: Schedule and track security audits
- **Policy Management**: Centralised policy documentation and tracking

### 📈 Dashboard Analytics
- **Real-time Metrics**: Live updates on risks, audits, and compliance
- **Performance Tracking**: Month-over-month comparison of key metrics
- **Quick Actions**: Rapid access to common tasks

## Technology Stack

- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB 6.18.0
- **Icons**: FontAwesome
- **Development**: ESLint, Turbopack

## Prerequisites

- Node.js 18+ 
- MongoDB instance (local or cloud)
- npm, yarn, pnpm, or bun package manager

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cycorgi
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```env
   MONGODB_URI=mongodb://localhost:27017/cycorgi
   ```

4. **Seed the database** (optional)
   ```bash
   npm run seed
   ```
   
   This populates the database with sample information assets for testing.

## Development

### Start the development server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run seed` - Seed database with sample data

## Project Structure

```
cycorgi/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── dashboard/         # Dashboard pages
│   ├── inventory/         # Asset management
│   └── layouts/           # Layout components
├── lib/                   # Utility functions
├── public/                # Static assets
├── scripts/               # Database seeding scripts
└── package.json
```

## Database Schema

### Information Assets Collection
Each asset includes:
- **Information Asset**: Asset name and identifier
- **Category**: Data classification (HR, Financial, etc.)
- **Type**: Asset type (Database, Documents, API, etc.)
- **Description**: Detailed asset description
- **Location**: Storage location
- **Owner**: Asset owner
- **SME**: Subject Matter Expert
- **Administrator**: Technical administrator
- **Agile Release Train**: ART designation
- **CIA Ratings**: Confidentiality, Integrity, Availability levels

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please refer to the project documentation or create an issue in the repository.
