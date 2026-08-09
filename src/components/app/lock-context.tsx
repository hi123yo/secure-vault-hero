import { createContext, useContext } from "react";

export const LockContext = createContext<{ lock: () => void }>({ lock: () => {} });
export const useLock = () => useContext(LockContext);