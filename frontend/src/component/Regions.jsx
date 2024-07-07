import { InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";

const regions = [
  "Region 1 Small Clients Office",
  "Region 1 Medium Clients Office",
  "Region 1 large Clients Office",
  "Region 2",
  "Region 3",


];
//regions.sort();
export default function Regions({ name, onChange, disabled }) {
  return (
    <>
      <InputLabel id="demo-simple-select-autowidth-label">Region</InputLabel>
      <Select
        disabled={disabled}
        color="info"
        labelId="simple-select-autowidth-label"
        id="demo-simple-select-autowidth"
        value={name}
        onChange={onChange}
        autoWidth
        label="Region"
      >
        {regions.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
