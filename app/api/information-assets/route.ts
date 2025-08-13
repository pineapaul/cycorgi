import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Comprehensive fake data for information assets
const fakeInformationAssets = [
  {
    id: '1',
    informationAsset: 'Customer Database',
    category: 'Customer Data',
    type: 'Database',
    description: 'Primary customer information database containing personal and financial data',
    location: 'AWS RDS',
    owner: 'John Smith',
    sme: 'Sarah Johnson',
    administrator: 'Mike Chen',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'High',
    criticality: 'mission-critical',
    additionalInfo: 'Requires encryption at rest and in transit'
  },
  {
    id: '2',
    informationAsset: 'Employee Records',
    category: 'HR Data',
    type: 'Database',
    description: 'HR employee data and performance records',
    location: 'On-Premise SQL Server',
    owner: 'Lisa Wang',
    sme: 'David Brown',
    administrator: 'Alex Rodriguez',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'High',
    integrity: 'Medium',
    availability: 'Medium',
    criticality: 'business-critical',
    additionalInfo: 'Contains sensitive HR information'
  },
  {
    id: '3',
    informationAsset: 'Financial Reports',
    category: 'Financial Data',
    type: 'Documents',
    description: 'Quarterly and annual financial statements',
    location: 'SharePoint Online',
    owner: 'Robert Davis',
    sme: 'Emily Wilson',
    administrator: 'Tom Anderson',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'Medium',
    criticality: 'business-critical',
    additionalInfo: 'Regulatory compliance required'
  },
  {
    id: '4',
    informationAsset: 'Source Code Repository',
    category: 'Intellectual Property',
    type: 'Code Repository',
    description: 'Application source code and version control',
    location: 'GitHub Enterprise',
    owner: 'Jennifer Lee',
    sme: 'Carlos Martinez',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    criticality: 'mission-critical',
    additionalInfo: 'Contains proprietary algorithms'
  },
  {
    id: '5',
    informationAsset: 'Network Infrastructure',
    category: 'Infrastructure',
    type: 'Network',
    description: 'Network devices and configuration data',
    location: 'On-Premise',
    owner: 'Kevin Thompson',
    sme: 'Amanda White',
    administrator: 'Steve Johnson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'Low',
    integrity: 'High',
    availability: 'Critical',
    criticality: 'mission-critical',
    additionalInfo: 'Critical for business operations'
  },
  {
    id: '6',
    informationAsset: 'API Keys',
    category: 'Security',
    type: 'Credentials',
    description: 'Third-party service integration keys',
    location: 'Azure Key Vault',
    owner: 'Patricia Garcia',
    sme: 'Daniel Kim',
    administrator: 'Maria Lopez',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    criticality: 'business-critical',
    additionalInfo: 'Rotated quarterly'
  },
  {
    id: '7',
    informationAsset: 'Backup Systems',
    category: 'Infrastructure',
    type: 'Backup',
    description: 'Automated system backups and disaster recovery files',
    location: 'Azure Storage',
    owner: 'David Brown',
    sme: 'Amanda White',
    administrator: 'Steve Johnson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Critical',
    criticality: 'mission-critical',
    additionalInfo: 'Encrypted and geo-replicated'
  },
  {
    id: '8',
    informationAsset: 'Marketing Materials',
    category: 'Marketing',
    type: 'Media',
    description: 'Brand assets, logos, and marketing collateral',
    location: 'Google Drive',
    owner: 'Tom Wilson',
    sme: 'Emily Wilson',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Low',
    integrity: 'Medium',
    availability: 'Medium',
    criticality: 'standard',
    additionalInfo: 'Publicly accessible for partners'
  },
  {
    id: '9',
    informationAsset: 'Compliance Documentation',
    category: 'Legal',
    type: 'Documents',
    description: 'Regulatory compliance documents and certifications',
    location: 'SharePoint Online',
    owner: 'Helen Rodriguez',
    sme: 'James Wilson',
    administrator: 'Lisa Chen',
    agileReleaseTrain: 'ART-5',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    criticality: 'business-critical',
    additionalInfo: 'Audit trail required'
  },
  {
    id: '10',
    informationAsset: 'Development Environment',
    category: 'Infrastructure',
    type: 'Development',
    description: 'Development servers and testing environments',
    location: 'AWS EC2',
    owner: 'Mark Johnson',
    sme: 'Carlos Martinez',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'Medium',
    criticality: 'standard',
    additionalInfo: 'Non-production data only'
  },
  {
    id: '11',
    informationAsset: 'Customer Support Tickets',
    category: 'Customer Data',
    type: 'Database',
    description: 'Customer support and service request records',
    location: 'Salesforce',
    owner: 'Anna Davis',
    sme: 'Sarah Johnson',
    administrator: 'Mike Chen',
    agileReleaseTrain: 'ART-2',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    criticality: 'business-critical',
    additionalInfo: 'Contains customer PII'
  },
  {
    id: '12',
    informationAsset: 'System Logs',
    category: 'Infrastructure',
    type: 'Logs',
    description: 'Application and system audit logs',
    location: 'Splunk',
    owner: 'Kevin Thompson',
    sme: 'Amanda White',
    administrator: 'Steve Johnson',
    agileReleaseTrain: 'ART-4',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'High',
    criticality: 'standard',
    additionalInfo: 'Retention policy: 1 year'
  },
  {
    id: '13',
    informationAsset: 'Vendor Contracts',
    category: 'Legal',
    type: 'Documents',
    description: 'Third-party vendor agreements and contracts',
    location: 'DocuSign',
    owner: 'Helen Rodriguez',
    sme: 'James Wilson',
    administrator: 'Lisa Chen',
    agileReleaseTrain: 'ART-5',
    confidentiality: 'High',
    integrity: 'High',
    availability: 'Medium',
    criticality: 'business-critical',
    additionalInfo: 'Legal review required'
  },
  {
    id: '14',
    informationAsset: 'Mobile App Backend',
    category: 'Infrastructure',
    type: 'API',
    description: 'Backend services for mobile applications',
    location: 'AWS Lambda',
    owner: 'Jennifer Lee',
    sme: 'Carlos Martinez',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-1',
    confidentiality: 'Medium',
    integrity: 'High',
    availability: 'Critical',
    criticality: 'mission-critical',
    additionalInfo: 'Real-time processing required'
  },
  {
    id: '15',
    informationAsset: 'Email Archive',
    category: 'Communication',
    type: 'Email',
    description: 'Corporate email archive and retention',
    location: 'Microsoft Exchange',
    owner: 'Tom Wilson',
    sme: 'Emily Wilson',
    administrator: 'Rachel Green',
    agileReleaseTrain: 'ART-3',
    confidentiality: 'Medium',
    integrity: 'Medium',
    availability: 'Medium',
    criticality: 'standard',
    additionalInfo: '7-year retention policy'
  }
]

export async function GET() {
  try {
    console.log('Fetching information assets from database...')
    // Connect to MongoDB
    const client = await clientPromise()
    const db = client.db('cycorgi')
    
    // Check if information assets collection exists and has data
    const collection = db.collection('information-assets')
    const existingData = await collection.find({}).limit(1).toArray()
    
    if (existingData.length === 0) {
      // Insert fake data if collection is empty
      await collection.insertMany(fakeInformationAssets)
      console.log('Inserted fake information assets data')
    }
    
    // Retrieve all information assets
    let informationAssets = await collection.find({}).toArray()
    console.log('Found information assets:', informationAssets.length)
    
    // Transform old data structure to new structure if needed
    informationAssets = informationAssets.map(asset => {
      // If it's the old structure, transform it
      if (asset.name && !asset.informationAsset) {
        return {
          ...asset,
          informationAsset: asset.name,
          category: asset.type === 'Database' ? 'Customer Data' : 
                   asset.type === 'File System' ? 'HR Data' :
                   asset.type === 'Document' ? 'Financial Data' :
                   asset.type === 'Code' ? 'Intellectual Property' :
                   asset.type === 'Media' ? 'Marketing' :
                   asset.type === 'Backup' ? 'Infrastructure' :
                   asset.type === 'Credentials' ? 'Security' :
                   asset.type === 'Configuration' ? 'Infrastructure' : 'Other',
          sme: asset.owner === 'John Smith' ? 'Sarah Johnson' :
               asset.owner === 'Sarah Johnson' ? 'David Brown' :
               asset.owner === 'Mike Davis' ? 'Emily Wilson' :
               asset.owner === 'Lisa Chen' ? 'Carlos Martinez' :
               asset.owner === 'Tom Wilson' ? 'Emily Wilson' :
               asset.owner === 'David Brown' ? 'Amanda White' :
               asset.owner === 'Emma Taylor' ? 'Daniel Kim' :
               asset.owner === 'Alex Rodriguez' ? 'Amanda White' : 'TBD',
          administrator: asset.owner === 'John Smith' ? 'Mike Chen' :
                       asset.owner === 'Sarah Johnson' ? 'Alex Rodriguez' :
                       asset.owner === 'Mike Davis' ? 'Tom Anderson' :
                       asset.owner === 'Lisa Chen' ? 'Rachel Green' :
                       asset.owner === 'Tom Wilson' ? 'Rachel Green' :
                       asset.owner === 'David Brown' ? 'Steve Johnson' :
                       asset.owner === 'Emma Taylor' ? 'Maria Lopez' :
                       asset.owner === 'Alex Rodriguez' ? 'Steve Johnson' : 'TBD',
          agileReleaseTrain: asset.owner === 'John Smith' ? 'ART-1' :
                           asset.owner === 'Sarah Johnson' ? 'ART-2' :
                           asset.owner === 'Mike Davis' ? 'ART-3' :
                           asset.owner === 'Lisa Chen' ? 'ART-1' :
                           asset.owner === 'Tom Wilson' ? 'ART-3' :
                           asset.owner === 'David Brown' ? 'ART-4' :
                           asset.owner === 'Emma Taylor' ? 'ART-2' :
                           asset.owner === 'Alex Rodriguez' ? 'ART-4' : 'ART-1',
          confidentiality: asset.classification === 'Confidential' ? 'High' :
                         asset.classification === 'Internal' ? 'Medium' :
                         asset.classification === 'Public' ? 'Low' :
                         asset.classification === 'Restricted' ? 'High' : 'Medium',
          integrity: asset.type === 'Database' ? 'High' :
                   asset.type === 'File System' ? 'Medium' :
                   asset.type === 'Document' ? 'High' :
                   asset.type === 'Code' ? 'High' :
                   asset.type === 'Media' ? 'Medium' :
                   asset.type === 'Backup' ? 'High' :
                   asset.type === 'Credentials' ? 'High' :
                   asset.type === 'Configuration' ? 'High' : 'Medium',
          availability: asset.type === 'Database' ? 'High' :
                      asset.type === 'File System' ? 'Medium' :
                      asset.type === 'Document' ? 'Medium' :
                      asset.type === 'Code' ? 'High' :
                      asset.type === 'Media' ? 'Medium' :
                      asset.type === 'Backup' ? 'Critical' :
                      asset.type === 'Credentials' ? 'Medium' :
                      asset.type === 'Configuration' ? 'Critical' : 'Medium',
          criticality: asset.type === 'Database' ? 'business-critical' :
                     asset.type === 'File System' ? 'standard' :
                     asset.type === 'Document' ? 'business-critical' :
                     asset.type === 'Code' ? 'mission-critical' :
                     asset.type === 'Media' ? 'standard' :
                     asset.type === 'Backup' ? 'mission-critical' :
                     asset.type === 'Credentials' ? 'business-critical' :
                     asset.type === 'Configuration' ? 'mission-critical' : 'standard',
          additionalInfo: asset.additionalInformation || 'No additional information'
        }
      }
      return asset
    })
    
    return NextResponse.json({
      success: true,
      data: informationAssets
    })
  } catch (error) {
    console.error('Error fetching information assets:', error)
    console.log('Falling back to fake data due to error')
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch information assets',
        data: fakeInformationAssets // Fallback to fake data
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const client = await clientPromise()
    const db = client.db('cycorgi')
    const collection = db.collection('information-assets')
    
    // Add timestamp and ID
    const newAsset = {
      ...body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await collection.insertOne(newAsset)
    
    return NextResponse.json({
      success: true,
      data: { ...newAsset, _id: result.insertedId }
    })
  } catch (error) {
    console.error('Error creating information asset:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create information asset' },
      { status: 500 }
    )
  }
} 