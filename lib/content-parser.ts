import katex from 'katex'

export interface ContentSegment {
  type: 'text' | 'math_display' | 'math_inline' | 'markdown'
  content: string
  id?: string
}

export interface ParsedContent {
  hasMarkdown: boolean
  hasMath: boolean
  segments: ContentSegment[]
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

function hasMarkdownSyntax(text: string): boolean {
  // Check for common markdown patterns
  const markdownPatterns = [
    /\*\*[^*]+\*\*/,          // **bold**
    /\*[^*\n]+\*/,            // *italic*
    /^#+\s/m,                 // # headers
    /^\*\s+/m,                // * bullet points
    /^\d+\.\s/m,              // 1. numbered lists
    /^\-\s+/m,                // - bullet points
    /`[^`]+`/,                // `code`
    /\[[^\]]+\]\([^)]+\)/,    // [link](url)
  ]
  
  return markdownPatterns.some(pattern => pattern.test(text))
}

export function parseContentWithMathAndMarkdown(content: string): ParsedContent {
  if (!content) {
    return {
      hasMarkdown: false,
      hasMath: false,
      segments: [{ type: 'text', content: '' }]
    }
  }

  const segments: ContentSegment[] = []
  
  // First, find all math expressions
  const mathPatterns = [
    { regex: /\\\[([\s\S]*?)\\\]/g, type: 'display' as const },
    { regex: /\\\(([\s\S]*?)\\\)/g, type: 'inline' as const },
    { regex: /\$([^$\n]+?)\$/g, type: 'inline' as const }
  ]
  
  // Find all math expressions
  const allMathMatches: Array<{ start: number; end: number; content: string; type: 'display' | 'inline' }> = []
  
  for (const pattern of mathPatterns) {
    let match
    pattern.regex.lastIndex = 0
    while ((match = pattern.regex.exec(content)) !== null) {
      allMathMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        type: pattern.type
      })
    }
  }
  
  // Sort matches by position and remove overlaps
  allMathMatches.sort((a, b) => a.start - b.start)
  
  // Remove overlapping matches
  const filteredMathMatches: Array<{ start: number; end: number; content: string; type: 'display' | 'inline' }> = []
  for (let i = 0; i < allMathMatches.length; i++) {
    const current = allMathMatches[i]
    const isOverlapping = filteredMathMatches.some(existing => 
      (current.start >= existing.start && current.start < existing.end) ||
      (current.end > existing.start && current.end <= existing.end)
    )
    if (!isOverlapping) {
      filteredMathMatches.push(current)
    }
  }
  
  let currentIndex = 0
  let hasMath = false
  let hasMarkdown = false
  
  // Process content segments
  for (const match of filteredMathMatches) {
    // Add text before this match
    if (match.start > currentIndex) {
      const textContent = content.slice(currentIndex, match.start)
      if (textContent) {
        const isMarkdown = hasMarkdownSyntax(textContent)
        if (isMarkdown) hasMarkdown = true
        
        segments.push({
          type: isMarkdown ? 'markdown' : 'text',
          content: textContent,
        })
      }
    }
    
    // Add the math segment
    if (match.content) {
      hasMath = true
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
      const isMarkdown = hasMarkdownSyntax(remainingText)
      if (isMarkdown) hasMarkdown = true
      
      segments.push({
        type: isMarkdown ? 'markdown' : 'text',
        content: remainingText,
      })
    }
  }
  
  // If no math found, check if the whole content has markdown
  if (segments.length === 0) {
    const isMarkdown = hasMarkdownSyntax(content)
    if (isMarkdown) hasMarkdown = true
    
    segments.push({
      type: isMarkdown ? 'markdown' : 'text',
      content: content,
    })
  }
  
  return {
    hasMarkdown,
    hasMath,
    segments
  }
} 