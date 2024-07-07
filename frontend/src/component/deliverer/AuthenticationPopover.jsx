import * as React from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useSelector } from "react-redux";
import axios from "axios";
import { server } from "server";
import toast from "react-hot-toast";
import { ClickAwayListener, Dialog, IconButton, Input, TextField } from "@mui/material";
import { SendOutlined } from "@mui/icons-material";
import  { useState, useRef } from 'react';
import { useEffect } from "react";

const BasicPopover = ({
  typeId,
  anchorEl,
  handleCloseAuthenticationPopup,
  isPopupSelected,
}) => {
  
  const { user } = useSelector((state) => state.user);
  const [password, setPassword] = React.useState("");
  

  const { deliverersPage } = useSelector((state) => state.deliverers);



  //const id = openAuthentication ? "simple-popover" : undefined;


  //console.log("open",openAuthentication)
  console.log("isSelected", isPopupSelected);
  console.log("anchor", anchorEl);
  const handleAuthenticationSubmit = async (e) => {
    e.preventDefault();
   // handleCloseAuthenticationPopup();

    const email = user.email;
    console.log(email);
    console.log(password);

    await axios
      .post(
        `${server}/user/login-user`,
        {
          email,
          password,
        },
        { withCredentials: true }
      )
      .then((res) => {
        toast.success("User verified");

        setTimeout(() => {
          handleCloseAuthenticationPopup(e, typeId);
        }, 750); // Adjust the delay time (in milliseconds) as needed
      })
      .catch((error) => {
        toast.error("Please enter your correct password");
      });
  };

  const passwordInputRef = useRef(null);

 

  useEffect(() => {
    setTimeout(() => {
      passwordInputRef.current?.focus();
      passwordInputRef.current?.select();
    }, 0);
   }, []);

  
  return (
    <div>
        <Popover
          //id={id}
          open={isPopupSelected}
          anchorEl={anchorEl}
          onClose={handleCloseAuthenticationPopup}
          disableRestoreFocus  
          //disableEnforceFocus
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            p: 3,
          }}
        >
          <TextField
       // inputRef={passwordInputRef}
            label="Admin Password"
            type="password"
            variant="standard"
            color="warning"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mr: 1 }}
            
          />
          <IconButton
            sx={{ mt: 0.5 }}
            type="submit"
            color="success"
            aria-label="Submit"
            onClick={(e) => handleAuthenticationSubmit(e, typeId)}
          >
            <SendOutlined />
          </IconButton>
        </Popover>
      
    </div>
  );
};

export default BasicPopover;
