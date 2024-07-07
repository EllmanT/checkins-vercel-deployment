import * as React from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function BasicDateTimePicker({ value, onChange, defaultTime ,isDisabled, labelName}) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
            disabled={isDisabled}
          label={labelName}
          value={value}
          onChange={onChange}
          ampm={false}
        />
      </LocalizationProvider>
    );
  }