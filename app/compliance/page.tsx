import Link from 'next/link';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export default function CompliancePage() {
  const complianceAreas = [
    {
      title: 'Statement of Applicability',
      description: 'ISO 27001:2022 Annex A controls assessment and documentation',
      href: '/compliance/statement-of-applicability',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Corrective Actions',
      description: 'Track and manage corrective actions to address compliance gaps and audit findings',
      href: '/compliance/corrective-actions',
      icon: AlertTriangle,
      color: 'bg-orange-500',
    },
    {
      title: 'Improvements',
      description: 'Track continuous improvement initiatives and enhancement opportunities for your ISMS',
      href: '/compliance/improvements',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {complianceAreas.map((area) => (
          <Link
            key={area.title}
            href={area.href}
            className="group block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${area.color} text-white`}>
                <area.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {area.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{area.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">85%</div>
            <div className="text-sm text-gray-600">Overall Compliance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">42</div>
            <div className="text-sm text-gray-600">Active Controls</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">8</div>
            <div className="text-sm text-gray-600">Open Gaps</div>
          </div>
        </div>
      </div>
    </div>
  );
} 