import { Field } from "../../types/Config";
import { ExternalInput } from "../ExternalInput";

export const InputOrGroup = ({
  name,
  field,
  value,
  onChange,
  readOnly,
}: {
  name: string;
  field: Field<any>;
  value: any;
  onChange: (e: React.FormEvent<HTMLInputElement | HTMLSelectElement>) => void;
  readOnly: boolean;
}) => {
  if (field.type === "group") {
    if (!field.items) {
      return null;
    }

    // Can't support groups until we have proper form system
    return <div>Groups not supported yet</div>;
  }

  if (field.type === "external") {
    if (!field.adaptor) {
      return null;
    }

    return (
      <>
        <div>{name}</div>
        <ExternalInput field={field} onChange={onChange} />
      </>
    );
  }

  if (field.type === "select") {
    if (!field.options) {
      return null;
    }

    return (
      <label>
        <div>{name}</div>
        <select onChange={onChange} value={value}>
          {field.options.map((option) => (
            <option
              key={option.label + option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </select>
      </label>
    );
  }

  return (
    <label>
      <div>{name}</div>
      {/* TODO use proper form lib */}
      <input
        autoComplete="off"
        type={field.type}
        name={name}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        style={{
          background: readOnly ? "#ddd" : "white",
          border: "1px solid grey",
        }}
      />
    </label>
  );
};
