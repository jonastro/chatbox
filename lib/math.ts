import katex from 'katex'

export interface MathSegment {
  type: 'text' | 'math_display' | 'math_inline'
  content: string
  id?: string
}

export function renderMath(latex: string, displayMode: boolean = false): string {
  try {
    console.log('Rendering LaTeX:', latex, 'Display mode:', displayMode)
    const result = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
      strict: false,
    })
    console.log('KaTeX result:', result.substring(0, 100))
    return result
  } catch (error) {
    console.error('Error rendering LaTeX:', error, 'Input:', latex)
    // Fallback to showing the original LaTeX with delimiters
    return displayMode ? `\\[${latex}\\]` : `\\(${latex}\\)`
  }
}

export function parseContentWithMath(content: string): MathSegment[] {
  if (!content) {
    return [{ type: 'text', content: '' }]
  }

  const segments: MathSegment[] = []
  
  // Regex patterns for LaTeX math - handle multiline with dotall behavior
  const patterns = [
    { regex: /\\\[([\s\S]*?)\\\]/g, type: 'display' as const },
    { regex: /\\\(([\s\S]*?)\\\)/g, type: 'inline' as const },
    { regex: /\$([^$\n]+?)\$/g, type: 'inline' as const }
  ]
  
  // Find all math expressions
  const allMatches: Array<{ start: number; end: number; content: string; type: 'display' | 'inline' }> = []
  
  for (const pattern of patterns) {
    let match
    // Reset regex lastIndex to ensure we start from the beginning
    pattern.regex.lastIndex = 0
    while ((match = pattern.regex.exec(content)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        type: pattern.type
      })
    }
  }
  
  // Sort matches by position and remove overlaps
  allMatches.sort((a, b) => a.start - b.start)
  
  // Remove overlapping matches (prefer the first one found)
  const filteredMatches: Array<{ start: number; end: number; content: string; type: 'display' | 'inline' }> = []
  for (let i = 0; i < allMatches.length; i++) {
    const current = allMatches[i]
    const isOverlapping = filteredMatches.some(existing => 
      (current.start >= existing.start && current.start < existing.end) ||
      (current.end > existing.start && current.end <= existing.end)
    )
    if (!isOverlapping) {
      filteredMatches.push(current)
    }
  }
  
  let currentIndex = 0
  
  // Process content segments
  for (const match of filteredMatches) {
    // Add text before this match
    if (match.start > currentIndex) {
      const textContent = content.slice(currentIndex, match.start)
      if (textContent) {
        segments.push({
          type: 'text',
          content: textContent,
        })
      }
    }
    
    // Add the math segment
    if (match.content) {
      segments.push({
        type: match.type === 'display' ? 'math_display' : 'math_inline',
        content: match.content,
        id: `math_${match.start}_${Date.now()}`,
      })
    }
    
    currentIndex = match.end
  }
  
  // Add remaining text
  if (currentIndex < content.length) {
    const remainingText = content.slice(currentIndex)
    if (remainingText) {
      segments.push({
        type: 'text',
        content: remainingText,
      })
    }
  }
  
  // If no math found, return the whole content as text
  if (segments.length === 0) {
    segments.push({
      type: 'text',
      content: content,
    })
  }
  
  return segments
} 