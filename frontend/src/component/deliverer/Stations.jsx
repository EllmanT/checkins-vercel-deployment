import { InputLabel, MenuItem, Select } from "@mui/material";
import React, { useState } from "react";

const stations = [
  "SCO Kurima",
  "Marondera",
  "Bindura",
  "Chinhoyi",
  "Kariba",
  "Kariba",






];
//stations.sort();
export default function Stations({ name, onChange, disabled }) {
  return (
    <>
      <InputLabel id="demo-simple-select-autowidth-label">Station</InputLabel>
      <Select
        disabled={disabled}
        color="info"
        labelId="simple-select-autowidth-label"
        id="demo-simple-select-autowidth"
        value={name}
        onChange={onChange}
        autoWidth
        label="Station"
      >
        {stations.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}
