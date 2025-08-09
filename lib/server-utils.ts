import clientPromise from './mongodb'

/**
 * Interface for SOA Control results returned by findSoAControlsByRiskId
 */
export interface SoAControlResult {
  id: string
  title: string
}

/**
 * Global function to find SOA controls that contain a specific risk ID in their relatedRisks field
 * @param riskId - The risk ID to search for in SOA controls (e.g., "RISK-001")
 * @returns Promise<SoAControlResult[]> - Array of control objects with id and title
 */
export async function findSoAControlsByRiskId(riskId: string): Promise<SoAControlResult[]> {
  if (!riskId || typeof riskId !== 'string') {
    throw new Error('Risk ID must be a non-empty string')
  }

  try {
    const client = await clientPromise
    const db = client.db('cycorgi')
    const collection = db.collection('soa_controls')
    
    // Find all controls where the relatedRisks array contains the specified riskId
    const controls = await collection.find(
      { relatedRisks: riskId },
      { projection: { id: 1, title: 1, _id: 0 } }
    ).toArray()
    
    // Return only the id and title fields as specified
    return controls.map(control => ({
      id: control.id,
      title: control.title
    return controls
  } catch (error) {
    console.error('Error finding SOA controls by risk ID:', error)
    throw new Error(`Failed to find SOA controls for risk ID: ${riskId}`)
  }
}
