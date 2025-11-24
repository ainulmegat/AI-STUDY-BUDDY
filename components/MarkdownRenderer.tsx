import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // This is a lightweight parser for bold, code blocks, and newlines.
  // It ensures the text looks structured without needing a full markdown library.
  
  const renderText = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Handle Headers
      if (line.startsWith('### ')) {
        return <h3 key={lineIndex} className="text-lg font-bold text-indigo-700 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={lineIndex} className="text-xl font-bold text-indigo-800 mt-5 mb-2">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={lineIndex} className="text-2xl font-bold text-indigo-900 mt-6 mb-3">{line.replace('# ', '')}</h1>;
      }
      
      // Handle Lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        return (
           <div key={lineIndex} className="flex items-start ml-4 mb-1">
            <span className="mr-2 text-indigo-500">•</span>
            <span>{parseInline(content)}</span>
           </div>
        );
      }

      // Handle Numbered Lists (basic detection)
      if (/^\d+\.\s/.test(line.trim())) {
         return (
            <div key={lineIndex} className="ml-4 mb-2 font-medium text-slate-800">
               {parseInline(line)}
            </div>
         )
      }

      if (line.trim() === '') {
        return <div key={lineIndex} className="h-2" />;
      }

      return <p key={lineIndex} className="mb-2 leading-relaxed">{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string) => {
    // Split by bold syntax (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-indigo-900">{part.slice(2, -2)}</strong>;
      }
      // Basic italic (*text*)
      const italicParts = part.split(/(\*.*?\*)/g);
       return italicParts.map((subPart, subIndex) => {
         if (subPart.startsWith('*') && subPart.endsWith('*') && subPart.length > 2) {
             return <em key={`${index}-${subIndex}`} className="italic text-slate-700">{subPart.slice(1, -1)}</em>;
         }
         return subPart;
       });
    });
  };

  return <div className="text-slate-700 text-sm md:text-base">{renderText(content)}</div>;
};

export default MarkdownRenderer;
