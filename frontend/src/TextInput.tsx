type Props = {
    label: string
    placeholder?: string
}

function TextInput({ label, placeholder = ""}: Props) {
    return (
        <div>
            <label>
                {label}:
                <input type="text" placeholder={placeholder} />
            </label>
        </div>
    )
}

export default TextInput;