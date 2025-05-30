import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";

export default function SearchBar({ value, onChange }) {
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  return (
    <TextField
      fullWidth
      placeholder={placeholderVisible ? "Search" : ""}
      variant="outlined"
      value={value}
      onFocus={() => setPlaceholderVisible(false)}
      onBlur={() => {
        if (!value) setPlaceholderVisible(true);
      }}
      onChange={(e) => onChange(e.target.value.toLowerCase())}
       InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Box
              component="img"
              src="/search-icon.png"
              alt="Search Icon"
              sx={{ width: 24, height: 24 }}
            />
          </InputAdornment>
        )
      }}
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
