'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { analyzeTextPattern } from '@/ai/flows/analyze-text-pattern';
import { Trash2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Block = {
  id: number;
  html: string;
  tag: 'h1' | 'p'; // Keep track of the wrapper tag
};

export default function MinimalistEditorPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load blocks from localStorage on initial render
  useEffect(() => {
    try {
      const storedBlocks = localStorage.getItem('minimalist-editor-blocks');
      if (storedBlocks) {
        const parsedBlocks = JSON.parse(storedBlocks);
        if (parsedBlocks.length > 0) {
          setBlocks(parsedBlocks);
        } else {
           setBlocks([{ id: Date.now(), tag: 'h1', html: '' }]);
        }
      } else {
        // Initialize with a single empty heading block if nothing is stored
        setBlocks([{ id: Date.now(), tag: 'h1', html: '' }]);
      }
    } catch (error) {
      console.error("Failed to parse blocks from localStorage", error);
      setBlocks([{ id: Date.now(), tag: 'h1', html: '' }]);
    }
  }, []);

  // Save blocks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('minimalist-editor-blocks', JSON.stringify(blocks));
    
    // Debounce the analysis
    if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(() => {
        handleAnalyze(true); // Call with isAuto flag
    }, 5000); // 5-second delay

    return () => {
        if(analysisTimeoutRef.current) {
            clearTimeout(analysisTimeoutRef.current)
        }
    };

  }, [blocks]);

  const handleAnalyze = async (isAuto = false) => {
    const allText = blocks.map(b => b.html.replace(/<[^>]*>/g, ' ')).join('\n');

    if (allText.trim().length < 50) { // Only analyze if there is some content
        if (!isAuto) { // Only show toast if triggered manually
             toast({
                title: "Not enough text",
                description: "Write a little more before analyzing your patterns.",
                duration: 3000,
            });
        }
        return;
    }

    try {
        const result = await analyzeTextPattern({ text: allText });
        toast({
            title: "AI Insights ✨",
            description: result.analysis,
            duration: 8000,
        });
    } catch (error) {
        console.error("Error analyzing text:", error);
        if (!isAuto) {
            toast({
                variant: "destructive",
                title: "Analysis Failed",
                description: "Could not analyze your text at the moment.",
            });
        }
    }
  };

  const handleBlockUpdate = (id: number, newHtml: string, newTag?: 'h1' | 'p') => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => 
        block.id === id 
        ? { ...block, html: newHtml, tag: newTag || block.tag } 
        : block
      )
    );
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, blockId: number) => {
    const currentBlockEl = e.currentTarget;
    const currentBlock = blocks.find(b => b.id === blockId);

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const newBlock: Block = { id: Date.now(), tag: 'p', html: '' };
      
      setBlocks(prevBlocks => {
        const currentBlockIndex = prevBlocks.findIndex(b => b.id === blockId);
        
        // This is the crucial part: update the state with the current content
        // BEFORE adding the new block.
        const updatedBlocks = prevBlocks.map(b => 
            b.id === blockId ? { ...b, html: currentBlockEl.innerHTML } : b
        );
        
        updatedBlocks.splice(currentBlockIndex + 1, 0, newBlock);
        return updatedBlocks;
      });

      // Focus the new block after it's rendered
      setTimeout(() => {
        const newElement = document.querySelector(`[data-block-id='${newBlock.id}']`);
        if (newElement) {
          (newElement as HTMLDivElement).focus();
        }
      }, 0);
    } else if (e.key === 'Backspace' && (currentBlockEl.innerHTML === '' || currentBlockEl.innerHTML === '<br>') && blocks.length > 1) {
      e.preventDefault();
      handleDeleteBlock(blockId);
    } else if (e.key === ' ' && currentBlock) {
      const text = currentBlockEl.innerText.trim();
      if (text === '#') {
        e.preventDefault();
        // Set innerHTML to empty to remove the '#'
        currentBlockEl.innerHTML = '';
        handleBlockUpdate(blockId, '', 'h1');
      } else if (text === '-' || text === '*') {
        e.preventDefault();
        // Set innerHTML to empty to remove the '-' or '*'
        currentBlockEl.innerHTML = '';
        handleBlockUpdate(blockId, '', 'p');
      }
    }
  };

  const handleDeleteBlock = (id: number) => {
    const deletedBlockIndex = blocks.findIndex(b => b.id === id);
    const newBlocks = blocks.filter(block => block.id !== id);
    setBlocks(newBlocks.length > 0 ? newBlocks : [{ id: Date.now(), tag: 'p', html: '' }]);
    
    if (newBlocks.length > 0 && deletedBlockIndex > 0) {
      setTimeout(() => {
        const prevBlock = blocks[deletedBlockIndex - 1];
        const prevElement = document.querySelector(`[data-block-id='${prevBlock.id}']`) as HTMLDivElement;
        if(prevElement) {
            prevElement.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(prevElement);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
      }, 0);
    }
  };
  
  const getBlockComponent = (block: Block) => {
    const { key, ...commonProps } = {
      key: block.id,
      'data-block-id': block.id,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(e, block.id),
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => handleBlockUpdate(block.id, e.currentTarget.innerHTML),
      dangerouslySetInnerHTML: { __html: block.html },
      className: "w-full outline-none min-h-[1em] focus:caret-neutral-100",
      'data-placeholder': "Type '#' + space for a heading. Just start writing for a paragraph.",
    };

    switch (block.tag) {
      case 'h1':
        return <h1 key={key} {...commonProps} className={`${commonProps.className} text-4xl font-headline text-neutral-100 focus:text-white`} />;
      case 'p':
      default:
        return <p key={key} {...commonProps} className={`${commonProps.className} text-lg text-neutral-300 focus:text-neutral-100`} />;
    }
  };

  return (
    <>
      <div 
        ref={editorRef}
        className="flex justify-start items-start min-h-screen bg-transparent pt-16 sm:pt-24 px-4 sm:px-8 md:px-16"
        onClick={(e) => {
            // If the click is on the main editor container itself (and not a child)
            if (e.target === editorRef.current && blocks.length > 0) {
                const lastBlockId = blocks[blocks.length - 1].id;
                const lastBlock = editorRef.current.querySelector(`[data-block-id='${lastBlockId}']`) as HTMLDivElement;
                if (lastBlock) {
                    lastBlock.focus();
                    // Move cursor to the end of the last block
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(lastBlock);
                    range.collapse(false); // false to collapse to the end
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }
        }}
      >
        <div className="w-full max-w-3xl">
          <div className="space-y-1">
            {blocks.map(block => (
              <div
                key={block.id}
                className="group relative"
              >
                {getBlockComponent(block)}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteBlock(block.id)}
                  className="absolute -left-10 top-1/2 -translate-y-1/2 h-8 w-8 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                  aria-label="Delete block"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          onClick={() => handleAnalyze(false)} 
          size="lg" 
          className="rounded-full shadow-lg"
          aria-label="Analyze with AI"
        >
          <Wand2 className="mr-2 h-5 w-5" />
          Analyze with AI
        </Button>
      </div>
    </>
  );
}
