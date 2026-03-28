type Props = {
    label: string
    placeholder?: string
    value: string;
    onChange: (val: string) => void;
};

function TextInput({ label, placeholder = "", value, onChange }: Props) {
    return (
        <div>
            <label>
                {label}:
                <input 
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </label>
        </div>
    )
}

export default TextInput;