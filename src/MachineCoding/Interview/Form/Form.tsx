import { useState } from "react";
import DynamicFormField from "./DynamicFormField";

interface formData {
  type: string;
  label: string;
}

type formArray = {
  list: formData[];
};

export default function Form({ list }: formArray) {
  const [newField, setNewField] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [allFields, setAllFields] = useState(list);

  const addNewField = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const checkDuplicate = allFields.some((li) => li.label === newLabel);
    if (checkDuplicate) return alert("Label already exists.");

    const NewField = {
      label: newLabel,
      type: newField,
    };

    setAllFields((prev) => [...prev, NewField]);
  };

  return (
    <>
      <form className="flex gap-2 border-2" onSubmit={addNewField}>
        <select value={newField} onChange={(e) => setNewField(e.target.value)} required>
          <option value="">Select Field</option>
          <option value="email">Email</option>
          <option value="text">Text</option>
          <option value="number">Number</option>
        </select>
        <input
          type="text"
          placeholder="Enter label name"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          required
        />
        <input type="submit" value="Add field" />
      </form>
      <div className="border-2 p-4">
        {allFields?.map(({ type, label }) => (
          <DynamicFormField key={label} type={type} label={label} />
        ))}
      </div>
    </>
  );
}
