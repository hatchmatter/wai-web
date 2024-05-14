"use client";

type SettingsOptionProps = {
  optionName: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const SettingsOption = ({ optionName, checked, onChange }: SettingsOptionProps) => {
  return (
    <>
      <div>
        <div className="form-control">
          <label className="label cursor-pointer flex justify-between items-center">
            <span className="label-text flex-grow pr-4 whitespace-nowrap">{optionName}</span>
            <input
              type="checkbox"
              className="toggle ml-auto"
              checked={checked}
              onChange={onChange}
            />
          </label>
        </div>
      </div>
    </>
  );
};

export default SettingsOption;
