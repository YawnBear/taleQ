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
          borderRadius: "40px",
          backgroundColor: "white",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "black",
            borderRadius: "40px"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1c843e",
            borderRadius: "40px"
          },
          "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1c843e",
            borderRadius: "40px"
          }
        },
        "& .MuiInputLabel-outlined": {
          color: "black",
          borderRadius: "40px",
          "&.Mui-focused": { color: "black", borderRadius: "40px", }
        }
      }}
    />
  );
}
