import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import routeName from '../config/routename.js';
import axios from "axios";
import styles from '../assets/css/Login.module.scss';
import classNames from "classnames/bind";

const cn = classNames.bind(styles);

const LoginPage = () => {

    const navigate = useNavigate();

    const [isVisible, setIsVisible] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const sendLoginRequest = async () => {
        const loginRequest = {
            username: username,
            password: password,
        }
        try {
            const res = await axios.post("http://localhost:8080/api/v1/auth/login", loginRequest);
            const loginResponse = res.data;
            localStorage.setItem("role", loginResponse.role);
            localStorage.setItem("token", loginResponse.token);
            localStorage.setItem("userFullName", loginResponse.userFullName);
            if(loginResponse.role === "ROLE_ADMIN"){
                navigate(routeName.teacher);
            }
            else {
                navigate(routeName.class);
            }
        } catch (error){
            if(error.response.status === 400){
                setIsVisible(true);
            }
        }

    }

    const handleKeyDown = (e) => {
        if(e.key === "Enter"){
            sendLoginRequest();
        }
    }

    return (
        <div className={cn('login-wrapper')}>
            <div className={cn('login-container')}>
                <h1 className={cn('title-login')}>Đăng nhập</h1>
                <div
                    className={cn('login-fail-notification')}
                    id="notification-fail"
                    style={{ display: isVisible ? "block" : "none" }}
                >
                    <p>Đăng nhập thất bại, vui lòng kiểm tra và thử lại</p>
                </div>
                <input
                    className={cn('input-login')}
                    name='username'
                    type='text'
                    placeholder='Tên đăng nhập'
                    autoComplete="off"
                    onChange={(e) => {setUsername(e.target.value)}}/>
                <input
                    className={cn('input-login')}
                    name='password'
                    type='password'
                    placeholder='Mật khẩu'
                    onChange={(e) => {setPassword(e.target.value)}}
                    onKeyDown={(e) => {handleKeyDown(e)}}
                />
                <div className={cn('forgot')}>
                    <a href="/forgot" className={cn('btn-forgot')}>Quên mật khẩu?</a>
                </div>
                <button
                    className={cn('btn-login')}
                    onClick={() => sendLoginRequest()}
                >
                    Đăng nhập</button>
            </div>
        </div>
    );
};

export default LoginPage;