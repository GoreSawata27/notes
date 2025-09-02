import PhoneBook from "./PhoneBook/PhoneBook";
import { MOCK_COUNTRY_OPTIONS } from "./PhoneBook/Constents";
import TodoList from "./TodoList/TodoList";

import Carousel from "./Carousel/Carousel";
import { images } from "./Carousel/Data";

import { tabs } from "./Tab/Data";
import Tab from "./Tab/Tab";

import { categories } from "./NestedCheckbox/Data";
import NestedCheckbox from "./NestedCheckbox/NestedCheckbox";

import ShowToast from "./Toaster/ShowToast";
import { useToastContext } from "./Toaster/ToasterContext";
import { useToast } from "./Toaster/useToast";
import { useState } from "react";
import StarRating from "./StarRating/StarRating";
import { AccordionData } from "./Accordion/AccData";
import Accordion from "./Accordion/Accordion";
import Dropdown from "./OverLayClose/Dropdown";
import InputEdit from "./InputEdit/InputEdit";
import { Data } from "./InputEdit/Array";
import SearchBar from "./SearchBar/SearchBar";
import { OptionsData } from "./SearchBar/OptionsData";
import TableSearch from "./Interview/TableSearch";

export default function MachineCoding() {
  const [question, setQuestion] = useState("NestedCheckbox");
  const { toasts } = useToastContext();
  const { showToast } = useToast();

  const options = [
    "Dropdown",
    "TableSearch",
    "Input Edit",
    "StarRating",
    "PhoneBook",
    "TodoList",
    "NestedCheckbox",
    "Carousel",
    "Tab",
    "ShowToast",
    "Accordion",
    "SearchBar",
  ];

  return (
    <>
      <select
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        name="Machine-coding-question"
        className=" block m-4 p-4 outline-2 absolute top-4 left-4 "
      >
        {options.map((que) => (
          <option key={que} id={que} value={que}>
            {que}
          </option>
        ))}
      </select>

      {question === "SearchBar" && <SearchBar options={OptionsData} />}
      {question === "TableSearch" && <TableSearch />}
      {question === "Input Edit" && <InputEdit data={Data} />}
      {question === "Dropdown" && <Dropdown />}
      {question === "Accordion" && <Accordion list={AccordionData} />}
      {question === "StarRating" && <StarRating />}
      {question === "PhoneBook" && <PhoneBook options={MOCK_COUNTRY_OPTIONS} />}
      {question === "TodoList" && <TodoList />}
      {question === "NestedCheckbox" && <NestedCheckbox categories={categories} />}
      {question === "Carousel" && <Carousel images={images} />}
      {question === "Tab" && <Tab tabs={tabs} />}
      {question === "ShowToast" && (
        <>
          Toaster
          <button onClick={() => showToast({ type: "error", message: "Something went wrong!" })}>
            Show Error Toast
          </button>
          <button onClick={() => showToast({ type: "success", message: "All good!" })}>
            Show Success Toast
          </button>
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
      )}
    </>
  );
}
