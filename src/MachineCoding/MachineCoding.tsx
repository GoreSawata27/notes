// import PhoneBook from "./PhoneBook/PhoneBook";
// import { MOCK_COUNTRY_OPTIONS } from "./PhoneBook/Constents";
// import TodoList from "./TodoList/TodoList";

// import Carousel from "./Carousel/Carousel";
// import { images } from "./Carousel/Data";

// import { tabs } from "./Tab/Data";
// import Tab from "./Tab/Tab";

// import { categories } from "./NestedCheckbox/Data";
// import NestedCheckbox from "./NestedCheckbox/NestedCheckbox";

import ShowToast from "./Toaster/ShowToast";
import { useToastContext } from "./Toaster/ToasterContext";
import { useToast } from "./Toaster/useToast";

export default function MachineCoding() {
  const { toasts } = useToastContext();
  const { showToast } = useToast();
  return (
    <>
      {/* <PhoneBook options={MOCK_COUNTRY_OPTIONS} /> */}
      {/* <TodoList /> */}
      {/* <NestedCheckbox categories={categories} /> */}
      {/* <Carousel images={images} /> */}
      {/* <Tab tabs={tabs} /> */}

      {/* Toaster */}
      <button onClick={() => showToast({ type: "error", message: "Something went wrong!" })}>
        Show Error Toast
      </button>
      <button onClick={() => showToast({ type: "success", message: "All good!" })}>Show Success Toast</button>
      <button onClick={() => showToast({ type: "info", message: "Fill all details" })}>
        Show Info Toast
      </button>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 w-80">
        {toasts.map((toast) => (
          <ShowToast key={toast.id} type={toast.type} message={toast.message} />
        ))}
      </div>
    </>
  );
}
