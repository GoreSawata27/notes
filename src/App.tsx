import "./App.css";
import { MOCK_COUNTRY_OPTIONS } from "./MachineCoding/PhoneBook/Constents";
import PhoneBook from "./MachineCoding/PhoneBook/PhoneBook";

function App() {
  return (
    <main>
      <PhoneBook options={MOCK_COUNTRY_OPTIONS} />
    </main>
  );
}

export default App;
