// SelectionContext.tsx
import { createContext, useContext, useState } from 'react';

const SelectionContext = createContext<{
  selectionMode: boolean;
  setSelectionMode: (val: boolean) => void;
} | undefined>(undefined);

export const SelectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectionMode, setSelectionMode] = useState(false);

  return (
    <SelectionContext.Provider value={{ selectionMode, setSelectionMode }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelectionContext = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelectionContext must be used within a SelectionProvider');
  }
  return context;
};
