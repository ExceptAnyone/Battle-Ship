import { useEffect } from "react";

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {                                  
  useEffect(() => {                                                                                            
    const handleKeyDown = (e: KeyboardEvent) => {                                                              
      shortcuts[e.key]?.();                                                                                    
    };                                                                                                         
    window.addEventListener("keydown", handleKeyDown);                                                         
    
    return () => window.removeEventListener("keydown", handleKeyDown);                                         
  }, [shortcuts]);                                                                                             
}      