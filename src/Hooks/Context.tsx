// import { createContext, useContext, useState } from "react";

// const unSavedChangesContext = createContext();

// export const useUnsavedChangesContext = () => useContext(unSavedChangesContext);

// export function UnsavedChangesProvider({ children }) {
//   const [isDirty, setIsDirty] = useState(false);
//   return (
//     <unSavedChangesContext.Provider value={{ isDirty, setIsDirty }}>
//       {children}
//     </unSavedChangesContext.Provider>
//   );
// }

//2

// <UnsavedChangesProvider>
//   <App />
// </UnsavedChangesProvider>;

// 3 use

// import { useUnsavedChangesContext } from "../../context/UnsavedChangesContext.js";
//   const { isDirty, setIsDirty } = useUnsavedChangesContext();
