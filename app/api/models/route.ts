import { NextResponse } from 'next/server'
import { getAvailableModels } from '@/lib/ollama'

export async function GET() {
  try {
    const models = await getAvailableModels()
    return NextResponse.json({ models })
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available models' },
      { status: 500 }
    )
  }
} 