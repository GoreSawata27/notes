type inputData = {
  type: string;
  label: string;
};

export default function DynamicFormField({ label, type }: inputData) {
  return (
    <span className=" flex flex-col gap-2">
      <label htmlFor={label}>{label} </label>
      <input className="border-2" id={label} type={type} />
    </span>
  );
}
