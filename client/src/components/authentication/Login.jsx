import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import Input from "@mui/material/Input";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Loading from "../extras/loading/Loading";
import Notify from "./Notify";
import "./Login.css";

export default function Login({translation, login}) {
    const [notify, setNotify] = useState(false);
    const [notifyText, setNotifyText] = useState('');
    const [username, setUsername] = useState('');
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

    const resetNotify = () => {
        setNotify(false);
        setNotifyText("");
    }

    const handleLogin = async () => {
        setLoading(true);
        setTimeout(() => {
            if(username == '' || password.password == '') {
                setNotify(true);
                setNotifyText(translation("login_failed_empty"));
                setLoading(false);
            } else {
                loginConfirmed();
            }
        }, 1000)
    }

    const loginConfirmed = async () => {
        const user = {
            username: username,
            password: password.password,
        }

        try {
            const response = await fetch(`/api/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            checkLoginData(data);
        } catch (err) {
            setLoading(false);
            console.error(err);
        }
    }

    const checkLoginData = (data) => {
        switch (data.notify) {
            case "login_user_not_found":
                setNotifyText(translation("login_user_not_found"));
                setNotify(true);
                setLoading(false);
                break;
            case "login_success":
                setNotifyText(translation("login_success"));
                setNotify(true);
                setLoading(false);
                emptyFields();

                login(data);
                break;
            default:
                break;
        }
    }

    const emptyFields = () => {
        setUsername('');
        setPassword({ ...password, showPassword: false });
        setPassword({ ...password, password: "" });
    }

    return (
    <>
        <div className="login-container">
            { loading ?
                <Loading 
                    text={translation("loading_logging_in")}
                    scale={1.8}
                />
            : undefined }
            <span className="login-label">{translation("login_label")}</span>
            { notify ?
              <div className="notify-container">
                <Notify text={notifyText} handlerNotify={resetNotify} />
              </div>
            : undefined }
            <div style={loading ? {display: "none"} : undefined} className="form-container">
                <Input
                  className="login-field"
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
                <Input
                  className="login-field"
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
                <button onClick={handleLogin} className="login-btn2">{translation("login_btn_text")}</button>
            </div>
        </div>
        <Outlet />
    </>
    )
}