type Props = {
    label: string
    extensions?: string[]
}

function FolderInput({ label, extensions = []}: Props) {
    const accept = extensions.map(ext => `.${ext}`).join(",")

    return (
        <div>
            <label>
                {label}:
                <input type="file" accept={accept} />
            </label>        
    </div>
    )
}

export default FolderInput;