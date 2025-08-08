# Cycorgi - Cybersecurity Risk Management Platform

A comprehensive cybersecurity risk management platform built with Next.js, designed to help organisations manage information assets, conduct risk assessments, and maintain regulatory compliance.

## Overview

Cycorgi provides a modern, intuitive interface for managing cybersecurity risks and information assets. The platform features a dashboard with key metrics, detailed asset management, comprehensive risk management workflows, and compliance tracking capabilities.

## Features

### 🛡️ Risk Management
- **Risk Register**: Complete risk tracking across all management phases
  - **Register**: Full overview of all risks
  - **Phase-based Filtering**: View risks by identification, analysis, evaluation, treatment, or monitoring phases
- **Risk Information Pages**: Detailed risk profiles with comprehensive information
- **Risk Treatments**: Track multiple treatments per risk with extension management
- **PDF Export**: Generate professional risk reports with complete details
- **Real-time Updates**: Live dashboard with key performance indicators

### 📊 Information Asset Management
- **Asset Inventory**: Complete information asset registry
- **CIA Assessments**: Confidentiality, Integrity, and Availability evaluations
- **Asset Classification**: Categorise assets by type, sensitivity, and criticality
- **Data Export**: CSV export functionality for asset data

### 🎯 Governance & Compliance
- **Policy Management**: Centralised policy documentation and tracking
- **Security Steering Committee**: Governance oversight and decision tracking
- **Compliance Tracking**: Monitor regulatory compliance scores
- **Audit Management**: Schedule and track security audits

### 📈 Dashboard Analytics
- **Real-time Metrics**: Live updates on risks, audits, and compliance
- **Performance Tracking**: Month-over-month comparison of key metrics
- **Quick Actions**: Rapid access to common tasks

## Technology Stack

- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: MongoDB 6.18.0
- **PDF Generation**: Playwright for server-side PDF export
- **Icons**: FontAwesome
- **Development**: ESLint, Turbopack
- **Infrastructure**: Terraform with Google Cloud Platform
- **CI/CD**: GitHub Actions with Workload Identity Federation
- **Container Registry**: Google Artifact Registry

## Prerequisites

- Node.js 18+
- MongoDB instance (local or cloud)
- npm, yarn, pnpm, or bun package manager
- Google Cloud Platform account (for production deployment)
- Terraform 1.7.0+ (for infrastructure management)

## Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cycorgi
   ```

2. **Install dependencies**
   ```bash
   npm install
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
   
   This populates the database with sample data for testing.

### Cloud Deployment

The application is configured for automated deployment to Google Cloud Platform using Terraform and GitHub Actions.

#### Prerequisites for Cloud Deployment
- Google Cloud Platform project with billing enabled
- Google Cloud Run API enabled
- Google Artifact Registry API enabled
- Workload Identity Federation configured
- Terraform state bucket in Google Cloud Storage

#### Deployment Process
1. **Infrastructure Setup**: Terraform manages the cloud infrastructure
2. **CI/CD Pipeline**: GitHub Actions automatically deploys on main branch pushes
3. **Container Deployment**: Application is deployed to Google Cloud Run
4. **Environment Management**: Separate environments for development and production

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

### Infrastructure Management

#### Terraform Commands
```bash
# Navigate to environment directory
cd infra/environments/dev

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure (use with caution)
terraform destroy
```

## Project Structure

```
cycorgi/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── dashboard/         # Dashboard pages
│   ├── governance/        # Governance and policy management
│   ├── inventory/         # Asset management
│   ├── layouts/           # Layout components
│   ├── risk-management/   # Risk management workflows
│   └── page.tsx          # Landing page
├── infra/                 # Infrastructure as Code
│   ├── environments/      # Environment-specific configurations
│   │   └── dev/          # Development environment
│   └── modules/          # Reusable Terraform modules
│       └── iam/          # Identity and Access Management
├── lib/                   # Utility functions
├── public/                # Static assets
├── scripts/               # Database seeding scripts
├── .github/               # GitHub Actions workflows
│   └── workflows/         # CI/CD pipeline definitions
└── package.json
```

## Infrastructure Architecture

### Google Cloud Platform Services
- **Cloud Run**: Serverless container platform for application hosting
- **Artifact Registry**: Container image storage and management
- **Cloud Storage**: Terraform state storage
- **IAM**: Identity and Access Management with Workload Identity Federation

### CI/CD Pipeline
- **GitHub Actions**: Automated deployment workflow
- **Workload Identity Federation**: Secure authentication between GitHub and GCP
- **Terraform**: Infrastructure as Code for consistent deployments
- **Container Registry**: Automated image building and deployment

### Environment Management
- **Development Environment**: Automated deployment on main branch pushes
- **State Management**: Centralized Terraform state in Google Cloud Storage
- **Configuration**: Environment-specific variables and secrets management

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

### Risk Register Collection
Each risk includes comprehensive tracking across all management phases:
- **Risk ID**: Unique risk identifier
- **Functional Unit**: Department or team responsible
- **Current Phase**: Current management phase
- **Jira Ticket**: Issue tracking reference
- **Risk Statement**: Detailed risk description
- **Information Assets**: Affected assets
- **Threat & Vulnerability**: Risk factors
- **Impact Assessment**: CIA impact evaluation
- **Current Controls**: Existing mitigation measures
- **Risk Ratings**: Current and residual risk levels
- **Treatment Plans**: Mitigation strategies and timelines
- **Approval Tracking**: Governance decision records

### Risk Treatments Collection
Each treatment includes:
- **Risk ID**: Associated risk identifier
- **Treatment Description**: Detailed treatment plan
- **Jira Ticket**: Treatment tracking reference
- **Owner**: Treatment owner
- **Due Dates**: Original and extended due dates
- **Extensions**: Multiple extension tracking with approval details
- **Completion Status**: Treatment completion and approval status

## Recent Updates

### Infrastructure & Deployment
- **Cloud Infrastructure**: Added Terraform configuration for Google Cloud Platform deployment
- **CI/CD Pipeline**: Implemented GitHub Actions workflow for automated deployments
- **Container Deployment**: Configured Google Cloud Run for serverless application hosting
- **Workload Identity Federation**: Secure authentication between GitHub Actions and GCP
- **Environment Management**: Separate development and production environment configurations
- **State Management**: Centralized Terraform state in Google Cloud Storage

### Risk Management Enhancements
- **Comprehensive Risk Register**: Complete risk lifecycle management with phase-specific views
- **Dynamic Data Filtering**: Risk data filtered by status for each management phase
- **Enhanced UI**: Professional styling with custom icons for each risk phase
- **PDF Export**: Generate professional risk reports with complete details and treatments
- **Type-safe Field Handling**: Robust form handling with proper TypeScript types
- **Toast Notifications**: Modern user feedback system replacing native alerts

### Architecture Improvements
- **Restructured Navigation**: Moved governance and risk management to top-level directories
- **Enhanced Component Design**: Consistent button styling and professional UI elements
- **Improved Data Management**: Comprehensive risk tracking with MongoDB integration
- **Secure ID Generation**: Cryptographically secure UUID generation for system reliability

### User Experience
- **Phase-Specific Views**: Tailored data tables for each risk management phase
- **Responsive Design**: Mobile-friendly interface with adaptive layouts
- **Professional Styling**: Consistent colour palette and modern UI elements
- **Loading States**: Visual feedback during data operations
- **Error Handling**: Comprehensive error handling with user-friendly messages

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
