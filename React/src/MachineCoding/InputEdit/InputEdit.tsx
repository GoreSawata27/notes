import { useState } from "react";

type data = {
  id: number;
  name: string;
};
type InputEditProps = {
  data: data[];
};

export default function InputEdit({ data }: InputEditProps) {
  const [value, setValue] = useState("Editable text");
  const [currentActive, setCurrentActive] = useState<number | null>(null);

  const handleChange = (id: number) => {
    data.map((item) => {
      if (item.id === id) {
        return { ...item, name: value };
      }
      return item;
    });
  };

  return (
    <div className="border">
      {data?.map((item) => (
        <div key={item.id}>
          <input
            type="text"
            readOnly={currentActive !== item.id}
            className="border p-2"
            value={item.name}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            onClick={() => {
              handleChange(item.id);
              setCurrentActive(item.id);
            }}
          >
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}
