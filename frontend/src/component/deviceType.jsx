import { InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";

const deviceType = [
  "Axis Solutions",
  "SAP",


];
//deviceType.sort();
export default function DeviceType({ name, onChange, disabled }) {
  return (
    <>
      <InputLabel id="demo-simple-select-autowidth-label">Device Type</InputLabel>
      <Select
        disabled={disabled}
        color="info"
        labelId="simple-select-autowidth-label"
        id="demo-simple-select-autowidth"
        value={name}
        onChange={onChange}
        autoWidth
        label="Type of Device"
      >
        {deviceType.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
