import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Container, Navbar, Nav} from 'react-bootstrap';
import Popup from "../components/Popup.jsx";
import Notificattion from '../components/Notificattion.jsx';
import routeName from '../config/routename';
import userImage from '../assets/images/user.png';
import classNames from 'classnames/bind';
import styles from '../assets/css/NavigationBar.module.scss';
import axios from "axios";

const cn = classNames.bind(styles);

const NavigationBar = (prop) => {

  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const role = localStorage.getItem('role');

  const [isVisible, setIsVisible] = useState(false);
  const [popup, setPopup] = useState(false);
  const [validateInput, setValidateInput] = useState({
    oldPassword: false,
    newPassword: false,
    newPasswordConfirm: false,
    matched: false,
});

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [response, setResponse] = useState({
    status: "",
    message: ""
  });

  const navigate = useNavigate();

  const signOut = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('userFullName');
    navigate(routeName.login);
  }

  const closePopup = () => {
    setPopup(false);
  }

  const validate = () => {
    setValidateInput({
      oldPassword: oldPassword === "",
      newPassword: newPassword === "",
      newPasswordConfirm: newPasswordConfirm === "",
    });

    if (
      oldPassword !== "" && newPassword !== "" && !validateInput.matched
    ) {
      return true;
    } else {
      return false;
    }
  }

  const handleChangePassword = async () => {
    try {
        if(validate()){
            const formData = new URLSearchParams();
            formData.append('oldPassword', oldPassword); 
            formData.append('newPassword', newPassword); 
            formData.append('role', role); 

            const res = await axios.post("http://localhost:8080/api/v1/account/change-password",
              formData, 
              {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded', 
                },
              }
            );
            setResponse({status: "success", message: res.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
            setPopup(false);
        }
    } catch (error) {
        setResponse({status: "failure", message: error.response.data.message});
        setTimeout(() => setResponse({ status: "", message: "" }), 3000);
    }
  }

  return (
    <>
      {response.message && <Notificattion response={response} />}

      <Navbar className={cn("navbar")} expand="lg">
        <Container className={cn("main-navbar")}>
          <Navbar.Brand className={cn("app-name")}>
            Trắc nghiệm trực tuyến
          </Navbar.Brand>
          <Navbar.Collapse className={cn("collapse")} id="basic-navbar-nav">
            <Nav className={cn("nav")} activeKey={prop.activeKey}>
              {/*<Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.home })} href={routeName.home}>Trang chủ</Nav.Link>*/}
              {role === "ROLE_ADMIN" && (
                <Nav.Link
                  className={cn("nav-link", {
                    active: prop.activeKey === routeName.teacher,
                  })}
                  href={routeName.teacher}
                >
                  Giáo viên
                </Nav.Link>
              )}
              {role === "ROLE_ADMIN" && (
                <Nav.Link
                  className={cn("nav-link", {
                    active: prop.activeKey === routeName.student,
                  })}
                  href={routeName.student}
                >
                  Sinh viên
                </Nav.Link>
              )}
              {(role === "ROLE_ADMIN" || role === "ROLE_TEACHER") && (
                <Nav.Link
                  className={cn("nav-link", {
                    active: prop.activeKey === routeName.subject,
                  })}
                  href={routeName.subject}
                >
                  Môn học
                </Nav.Link>
              )}
              <Nav.Link
                className={cn("nav-link", {
                  active: prop.activeKey === routeName.class,
                })}
                href={routeName.class}
              >
                Lớp học
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>

        <div className={cn("actions")}>
          <p className={cn("user-name")}>
            {localStorage.getItem("userFullName")}
          </p>
          <div
            className={cn("avatar-image")}
            onClick={() => setIsVisible(!isVisible)}
          >
            <img src={userImage} alt="user-image" className={cn("image")} />
            <i className="fa-solid fa-angle-down"></i>
          </div>

          <div
            className={cn("dropdown")}
            style={{ display: isVisible ? "block" : "none" }}
          >
            {role === "ROLE_TEACHER" && (
              <p className={cn("dropdown-item")}>Cập nhật thông tin</p>
            )}
            <p 
              className={cn("dropdown-item")}
              onMouseDown={() => {
                setIsVisible(!isVisible)
                setPopup(true)
              }}
            >Đổi mật khẩu</p>
            <p className={cn("dropdown-item")} onClick={() => signOut()}>
              Đăng xuất
            </p>
          </div>
        </div>
      </Navbar>

      {popup && (
        <Popup onClick={() => closePopup()}>
          <div className={cn("change-password-form")}>
            <div className={cn("form-header")}>
              <h1 className={cn("title")}>Đổi mật khẩu</h1>
              <i
                className="fa-regular fa-circle-xmark"
                onClick={() => closePopup()}
              ></i>
            </div>

            <input
              className={cn("input-password")}
              name="file"
              type="password"
              placeholder="Mật khẩu cũ"
              autoComplete="off"
              onChange={(e) => setOldPassword(e.target.value)}
            />

            {validateInput.oldPassword && <p>Vui lòng nhập mật khẩu cũ</p>}

            <input
              className={cn("input-password")}
              name="file"
              type="password"
              placeholder="Mật khẩu mới"
              autoComplete="off"
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {validateInput.newPassword && <p>Vui lòng nhập mật khẩu mới</p>}

            <input
              className={cn("input-password")}
              name="file"
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              autoComplete="off"
              onChange={(e) => {
                setNewPasswordConfirm(e.target.value)
                if(e.target.value !== newPassword){
                  setValidateInput({ ...validateInput, matched: true })
                } else {
                  setValidateInput({ ...validateInput, matched: false })
                }
              }}
            />

            {validateInput.matched && <p>Mật khẩu mới không trùng khớp</p>}
            {validateInput.newPasswordConfirm && <p>Vui lòng xác nhận mật khẩu</p>}

            <button
              className={cn("btn-confirm")}
              onClick={() => {
                handleChangePassword()
              }}
            >
              Đổi mật khẩu
            </button>
          </div>
        </Popup>
      )}
    </>
  );

};

export default NavigationBar;