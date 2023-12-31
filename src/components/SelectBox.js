import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"

const SelectBox = ({ options = [], name, label, value, onChange = () => { } }) => {
    return (
        <FormControl fullWidth>
            <InputLabel id="fid-label">{label}</InputLabel>
            <Select
                labelId="fid-label"
                id="fid-select"
                name={name}
                label={label}
                value={value}
                onChange={onChange}
            >
                <MenuItem value={0}>All</MenuItem>
                {options?.map((option, index) => (
                    <MenuItem value={option}>{option}</MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}
export default SelectBox