import { useState } from "react";

interface Data {
  id: string;
  label: string;
  children?: Data[];
}

interface NestedCheckboxProps {
  categories: Data[];
}

export default function NestedCheckbox({ categories }: NestedCheckboxProps) {
  const [isChecked, setIsChecked] = useState<{ [key: string]: boolean }>({});

  const handleCheck = (checked: boolean, item: Data) => {
    setIsChecked((prev) => {
      const newState = { ...prev, [item.id]: checked };

      const updateChildren = (node: Data) => {
        node.children?.forEach((child) => {
          newState[child.id] = checked;
          updateChildren(child);
        });
      };

      const updateParents = (node: Data, allData: Data[]) => {
        const findParent = (targetId: string, nodes: Data[], parent?: Data): Data | undefined => {
          for (const node of nodes) {
            if (node.id === targetId) return parent;
            if (node.children) {
              const found = findParent(targetId, node.children, node);
              if (found) return found;
            }
          }
          return undefined;
        };

        const parent = findParent(node.id, categories);
        if (parent && parent.children) {
          const allChecked = parent.children.every((child) => newState[child.id]);
          newState[parent.id] = allChecked;
          updateParents(parent, allData);
        }
      };

      updateChildren(item);
      updateParents(item, categories);

      return newState;
    });
  };

  const renderTree = (items: Data[]) => {
    return (
      <ul className="ml-4">
        {items?.map((item) => (
          <li key={item.id}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!isChecked[item.id]}
                onChange={(e) => handleCheck(e.target.checked, item)}
              />
              {item.label}
            </label>
            {item.children && renderTree(item.children)}
          </li>
        ))}
      </ul>
    );
  };

  return <div>{renderTree(categories)}</div>;
}
