import { NextRequest, NextResponse } from 'next/server'
import { findSoAControlsByRiskId } from '../../../../../lib/server-utils'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ riskId: string }> }
) {
  try {
    const { riskId } = await context.params
    
    if (!riskId) {
      return NextResponse.json({
        success: false,
        error: 'Risk ID parameter is required'
      }, { status: 400 })
    }

    const controls = await findSoAControlsByRiskId(riskId)
    
    return NextResponse.json({
      success: true,
      data: controls,
      count: controls.length,
      riskId: riskId
    })
  } catch (error) {
    console.error('Error finding SOA controls by risk ID:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find SOA controls'
    }, { status: 500 })
  }
}
