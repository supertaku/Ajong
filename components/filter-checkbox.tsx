"use client";

import { useId, type ChangeEventHandler, type ReactNode } from "react";

type FilterCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  label: ReactNode;
  name?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

export function FilterCheckbox({ checked, disabled = false, label, name, onChange }: FilterCheckboxProps) {
  const id = useId();

  return (
    <label className="filter-checkbox" htmlFor={id}>
      <input id={id} name={name} type="checkbox" checked={checked} disabled={disabled} onChange={onChange} />
      <span className="filter-checkbox__mark" aria-hidden="true">
        <svg width="45" height="45" viewBox="0 0 95 95" focusable="false">
          <rect x="30" y="20" width="50" height="50" fill="none" />
          <g transform="translate(0,-952.36222)">
            <path
              className="filter-checkbox__path"
              d="m 56,963 c -102,122 6,9 7,9 17,-5 -66,69 -38,52 122,-77 -7,14 18,4 29,-11 45,-43 23,-4"
              strokeWidth="3"
              fill="none"
            />
          </g>
        </svg>
      </span>
      <span className="filter-checkbox__label">{label}</span>
    </label>
  );
}
