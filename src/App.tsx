import "./App.css";
import MachineCoding from "./MachineCoding/MachineCoding";
import ToasterContextProvider from "./MachineCoding/Toaster/ToasterContext";

function App() {
  return (
    <ToasterContextProvider>
      <MachineCoding />
    </ToasterContextProvider>
  );
}

export default App;
