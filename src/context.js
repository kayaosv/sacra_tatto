import { createContext, useContext } from 'react';

export const LSCCtx = createContext(null);
export const useLSC = () => useContext(LSCCtx);
