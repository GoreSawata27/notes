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

export default function MachineCoding() {
  const [questions, setQuestions] = useState("NestedCheckbox");
  const { toasts } = useToastContext();
  const { showToast } = useToast();

  const options = ["PhoneBook", "TodoList", "NestedCheckbox", "Carousel", "Tab", "ShowToast"];

  return (
    <>
      <select
        value={questions}
        onChange={(e) => setQuestions(e.target.value)}
        name="Machine-coding-questions"
        className=" block m-4 p-4 outline-2 "
      >
        {options.map((que) => (
          <option id={que} value={que}>
            {que}
          </option>
        ))}
      </select>

      {questions === "PhoneBook" && <PhoneBook options={MOCK_COUNTRY_OPTIONS} />}
      {questions === "TodoList" && <TodoList />}
      {questions === "NestedCheckbox" && <NestedCheckbox categories={categories} />}
      {questions === "Carousel" && <Carousel images={images} />}
      {questions === "Tab" && <Tab tabs={tabs} />}
      {questions === "ShowToast" && (
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
