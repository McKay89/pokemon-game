import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import Input from "@mui/material/Input";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Loading from '../extras/Loading';
import Notify from "./Notify";
import "./Register.css";

export default function Register({translation}) {
    const [notify, setNotify] = useState(false);
    const [notifyText, setNotifyText] = useState('');
    const [checkbox, setCheckbox] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [birthday, setBirthday] = useState('');
    const [gender, setGender] = useState('Male');
    const [password, setPassword] = useState({
      password: "",
      showPassword: false,
    });
    const [loading, setLoading] = useState(false);

    const handleClickShowPassword = () => {
      setPassword({ ...password, showPassword: !password.showPassword });
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handlePassword = (prop) => (event) => {
      setPassword({ ...password, [prop]: event.target.value });
    };

    const handleUsername = (event) => {
      setUsername(event.target.value);
    }

    const handleEmail = (event) => {
      setEmail(event.target.value);
    }

    const handleBirthday = (event) => {
      setBirthday(event.target.value);
    }

    const handleCheckbox = () => {
      setCheckbox(!checkbox);
    }

    const handleGender = (event) => {
      setGender(event.target.value);
    }

    const resetNotify = () => {
      setNotify(false);
      setNotifyText("");
    }

    const handleRegister = async () => {
      setLoading(true);
      setTimeout(() => {
        if(username == "" ||
          password.password == "" ||
          email == "" ||
          birthday == ""
        ) {
          setNotifyText(translation("notify_register_input_empty"));
          setNotify(true);
          setLoading(false);
        } else if(username.length < 4 || username.length > 15) {
          setNotifyText(translation("notify_register_username_length"));
          setNotify(true);
          setLoading(false);
        } else if(password.password.length < 6 || password.password.length > 30) {
          setNotifyText(translation("notify_register_password_length"));
          setNotify(true);
          setLoading(false);
        } else if(!checkbox) {
          setNotifyText(translation("notify_register_checkbox_text"));
          setNotify(true);
          setLoading(false);
        } else {
          registerConfirmed();
        }
      }, 3000)
    }

    const registerConfirmed = async () => {
      const user = {
        username: username,
        password: password.password,
        email: email,
        gender: gender,
        birthday: birthday
      }

      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(user)
        });
        const data = await response.json();
        
        checkRegisterResponse(data);
      } catch (err) {
        setLoading(false);
        console.error(err);
      }
    }

    const checkRegisterResponse = (data) => {
      switch (data) {
        case "register_username_taken":
          setNotifyText(translation("register_username_taken"));
          setNotify(true);
          setLoading(false);   
          break;
        case "register_email_taken":
          setNotifyText(translation("register_email_taken"));
          setNotify(true);
          setLoading(false);
          break;
        case "register_success":
          setNotifyText(translation("register_success"));
          setNotify(true);
          setLoading(false);
          emptyFields();
          break;
        default:
          break;
      }
    }

    const emptyFields = () => {
      setCheckbox(false);
      setUsername('');
      setEmail('');
      setPassword({ ...password, showPassword: false });
      setPassword({ ...password, password: "" });
      setBirthday('')
      setGender('Male');
    }

    return (
      <>
        <div className="register-container">
            { loading ?
              <Loading 
                text={translation("loading_register")}
                scale={1.8}
              />
            : undefined }
            <span className="register-label">{translation("register_label")}</span>
            { notify ?
              <div className="notify-container">
                <Notify text={notifyText} handlerNotify={resetNotify} />
              </div>
            : undefined }
            <div style={loading ? {display: "none"} : undefined} className="form-container">
            <Tooltip
              title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("register_username_req")}</span>}
              placement='top'
              arrow
              TransitionComponent={Zoom}
              TransitionProps={{ timeout: 600 }}
            >
                <Input
                  className="register-field"
                  style={{
                    color: '#d5d747',
                    padding: '15px',
                    letterSpacing: '2px',
                    fontSize: "18px"
                  }}
                  type="text"
                  onChange={handleUsername}
                  placeholder={translation("register_username")}
                  value={username}
                />
              </Tooltip>
              <Tooltip
                title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("register_password_req")}</span>}
                placement='top'
                arrow
                TransitionComponent={Zoom}
                TransitionProps={{ timeout: 600 }}
              >
                <Input
                  className="register-field"
                  style={{
                    color: '#d5d747',
                    padding: '15px',
                    letterSpacing: '2px',
                    fontSize: "18px"
                  }}
                  type={password.showPassword ? "text" : "password"}
                  onChange={handlePassword("password")}
                  placeholder={translation("register_password")}
                  value={password.password}
                  endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            style={{
                              color: '#d5d747',
                              transform: 'scale(0.8)'
                            }}
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                        >
                            {password.showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                  }
                />
              </Tooltip>
              <Tooltip
                title={<span style={{ color: "#fff", fontSize: "14px" }}>{translation("register_email_req")}</span>}
                placement='top'
                arrow
                TransitionComponent={Zoom}
                TransitionProps={{ timeout: 600 }}
              >
                <Input
                  className="register-field"
                  style={{
                    color: '#d5d747',
                    padding: '15px',
                    letterSpacing: '2px',
                    fontSize: "18px"
                  }}
                  type="text"
                  onChange={handleEmail}
                  placeholder={translation("register_email")}
                  value={email}
                />
              </Tooltip>
              <select value={gender} onChange={handleGender} className="register-select-item">
                <option value="Male">{translation("register_gender_male")}</option>
                <option value="Female">{translation("register_gender_female")}</option>
              </select>
              <Input
                className="register-field"
                style={{
                  color: '#d5d747',
                  padding: '15px',
                  letterSpacing: '2px',
                  fontSize: "18px"
                }}
                type="date"
                onChange={handleBirthday}
                placeholder={translation("register_born")}
                value={birthday}
              />
              <div className="register-checkform">
                <hr />
                <span>{translation("register_checkform_text")}
                  <br /><span>{translation("register_checkform_ua")}</span>.
                </span><br /><hr />
                <input
                  checked={checkbox}
                  defaultChecked={checkbox}
                  onClick={handleCheckbox}
                  type="checkbox"
                  className="register-checkbox"
                />
                <label>&nbsp;&nbsp;{translation("register_accept_ua")}</label>
              </div>
              {
                !checkbox ||
                username == '' ||
                password == '' ||
                email == '' ||
                birthday == ''
              ?
                <button disabled className="register-btn-inactive">{translation("register_btn_text")}</button>
              :
                <button onClick={handleRegister} className="register-btn-active">{translation("register_btn_text")}</button>
              }
            </div>
        </div>
        <Outlet />
      </>
    )
}