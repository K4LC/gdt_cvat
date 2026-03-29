type Props = {
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
}

function FileInput({ label, accept, onChange }: Props) {

  return (
    <div>
      <label>
        {label}:
        <input
          type="file"
          accept={accept}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.currentTarget.files;
            if (!files || files?.length === 0) return;

            const file = files[0];

          }}
        />
      </label>
    </div>
  )
}

export default FileInput;