import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

// Fake data for information assets
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
    additionalInfo: 'Publicly accessible for partners'
  }
]

export async function GET() {
  try {
    // Connect to MongoDB
    const client = await clientPromise
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
    const informationAssets = await collection.find({}).toArray()
    
    return NextResponse.json({
      success: true,
      data: informationAssets
    })
  } catch (error) {
    console.error('Error fetching information assets:', error)
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
    const client = await clientPromise
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