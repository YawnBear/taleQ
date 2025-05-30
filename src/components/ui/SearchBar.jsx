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
              sx={{ width: 20, height: 20 }}
            />
          </InputAdornment>
        ),
        sx: {
          height: 36, // adjust the height as needed
          padding: "0 8px"
        }
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          color: "black",
          borderRadius: "40px",
          backgroundColor: "white",
          fontSize: 14,
          height: "32px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "green",
            borderWidth: "1px", // thinner outline
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1c843e",
            borderWidth: "1px",
          },
          "&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1c843e",
            borderWidth: "1px",
          }
        },
        "& .MuiInputLabel-outlined": {
          color: "black",
          "&.Mui-focused": {
            color: "black"
          }}
      }}
    />
  );
}
