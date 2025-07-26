// import PhoneBook from "./PhoneBook/PhoneBook";
// import { MOCK_COUNTRY_OPTIONS } from "./PhoneBook/Constents";
// import TodoList from "./TodoList/TodoList";

// import Carousel from "./Carousel/Carousel";
// import { images } from "./Carousel/Data";
import { tabs } from "./Tab/Data";
import Tab from "./Tab/Tab";

// import { categories } from "./NestedCheckbox/Data";
// import NestedCheckbox from "./NestedCheckbox/NestedCheckbox";

export default function MachineCoding() {
  return (
    <>
      {/* <PhoneBook options={MOCK_COUNTRY_OPTIONS} /> */}
      {/* <TodoList /> */}
      {/* <NestedCheckbox categories={categories} /> */}
      {/* <Carousel images={images} /> */}

      <Tab tabs={tabs} />
    </>
  );
}
