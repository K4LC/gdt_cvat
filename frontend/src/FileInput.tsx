type Props = {
  label: string;
  accept?: string[];
  onChange: (file: File | null) => void;
};

function FileInput({ label, accept, onChange }: Props) {

  return (
    <div>
      <label>{label}</label>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0] || null;
          onChange(file);
        }}
        accept={accept?.map((ext) => "." + ext).join(",")}
      />
    </div>
  );
}

export default FileInput;