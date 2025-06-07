'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components'
import { parseContentWithMathAndMarkdown, renderMath, type ContentSegment } from '@/lib/content-parser'

const ContentContainer = styled.div`
  line-height: 1.6;
  color: inherit;
`

const MathDisplay = styled.div`
  margin: 1rem 0;
  text-align: center;
  
  .katex-display {
    margin: 0;
  }
`

const MathInline = styled.span`
  .katex {
    font-size: 1em;
  }
`

const MarkdownContainer = styled.div`
  // Markdown styling
  h1, h2, h3, h4, h5, h6 {
    color: inherit;
    font-weight: 600;
    margin: 0.8em 0 0.4em 0;
    line-height: 1.3;
  }

  h1 { font-size: 1.4em; }
  h2 { font-size: 1.3em; }
  h3 { font-size: 1.2em; }
  h4 { font-size: 1.1em; }
  h5 { font-size: 1em; }
  h6 { font-size: 0.9em; }

  p {
    margin: 0.5em 0;
  }

  strong {
    font-weight: 600;
    color: inherit;
  }

  em {
    font-style: italic;
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  li {
    margin: 0.2em 0;
    line-height: 1.5;
  }

  code {
    background: rgba(255, 255, 255, 0.1);
    padding: 0.1em 0.3em;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    background: rgba(255, 255, 255, 0.05);
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 0.5em 0;
  }

  pre code {
    background: none;
    padding: 0;
  }

  blockquote {
    border-left: 3px solid rgba(255, 255, 255, 0.3);
    margin: 0.5em 0;
    padding: 0.1em 0 0.1em 1em;
    font-style: italic;
    opacity: 0.9;
  }

  a {
    color: #60a5fa;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`

interface ContentRendererProps {
  content: string
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({ content }) => {
  if (!content) return null

  const parsed = parseContentWithMathAndMarkdown(content)

  if (!parsed.hasMath && !parsed.hasMarkdown) {
    // Plain text - just render as is
    return (
      <ContentContainer>
        {content.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < content.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </ContentContainer>
    )
  }

  return (
    <ContentContainer>
      {parsed.segments.map((segment, index) => {
        switch (segment.type) {
          case 'math_display':
            return (
              <MathDisplay
                key={segment.id || `display-${index}`}
                dangerouslySetInnerHTML={{
                  __html: renderMath(segment.content, true)
                }}
              />
            )
          
          case 'math_inline':
            return (
              <MathInline
                key={segment.id || `inline-${index}`}
                dangerouslySetInnerHTML={{
                  __html: renderMath(segment.content, false)
                }}
              />
            )
          
          case 'markdown':
            return (
              <MarkdownContainer key={index}>
                <ReactMarkdown>
                  {segment.content}
                </ReactMarkdown>
              </MarkdownContainer>
            )
          
          case 'text':
          default:
            return (
              <span key={index}>
                {segment.content.split('\n').map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < segment.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </span>
            )
        }
      })}
    </ContentContainer>
  )
} 