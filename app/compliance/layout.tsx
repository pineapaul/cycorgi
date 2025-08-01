import { ReactNode } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';

interface ComplianceLayoutProps {
  children: ReactNode;
}

export default function ComplianceLayout({ children }: ComplianceLayoutProps) {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Compliance</h1>
        <p className="text-gray-600 mt-2">
          Manage compliance frameworks, certifications, and regulatory requirements
        </p>
      </div>
      {children}
    </DashboardLayout>
  );
} 