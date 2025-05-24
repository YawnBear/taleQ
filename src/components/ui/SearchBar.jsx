import TextField from "@mui/material/TextField";

export default function SearchBar({ value, onChange }) {
  return (
    <TextField
      fullWidth
      label="Search"
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value.toLowerCase())}
      sx={{
        "& .MuiOutlinedInput-root": {
          color: "black",
          borderRadius: "8px",
          backgroundColor: "white",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "black",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1c843e",
          },
          "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1c843e",
          }
        },
        "& .MuiInputLabel-outlined": {
          color: "black",
          "&.Mui-focused": { color: "black" }
        }
      }}
    />
  );
}
