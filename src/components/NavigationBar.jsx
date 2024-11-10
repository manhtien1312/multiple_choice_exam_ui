/* eslint-disable react/prop-types */
import {Container, Navbar, Nav} from 'react-bootstrap';
import routeName from '../config/routename';
import userImage from '../assets/images/user.png';
import classNames from 'classnames/bind';
import styles from '../assets/css/NavigationBar.module.scss';
import {useState} from "react";
import {useNavigate} from "react-router-dom";

const cn = classNames.bind(styles);

const NavigationBar = (prop) => {

  const role = localStorage.getItem('role');

  const [isVisible, setIsVisible] = useState(false);

  const navigate = useNavigate();

  const signOut = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('userFullName');
    navigate(routeName.login);
  }

  return (
    <>
      <Navbar className={cn('navbar')} expand="lg">
        <Container className={cn('main-navbar')}>
          <Navbar.Brand className={cn('app-name')}>
            Trắc nghiệm trực tuyến
          </Navbar.Brand>
          <Navbar.Collapse className={cn('collapse')}
                           id="basic-navbar-nav">
            <Nav className={cn('nav')}
              activeKey={prop.activeKey}
            >
              {/*<Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.home })} href={routeName.home}>Trang chủ</Nav.Link>*/}
              {
                role === "ROLE_ADMIN" &&
                  <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.teacher })} href={routeName.teacher}>Giáo viên</Nav.Link>
              }
              {
                (role === "ROLE_STUDENT" || role === "ROLE_TEACHER") &&
                  <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.class})} href={routeName.class}>Lớp học</Nav.Link>
              }
              {
                role === "ROLE_ADMIN" &&
                  <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.student })} href={routeName.student}>Sinh viên</Nav.Link>
              }
              {
                (role === "ROLE_ADMIN" || role === "ROLE_TEACHER") &&
                  <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.subject })} href={routeName.subject}>Môn học</Nav.Link>
              }
            </Nav>
          </Navbar.Collapse>

        </Container>

        <div className={cn('actions')}>
          <p className={cn('user-name')}>
            {
              localStorage.getItem("userFullName")
            }
          </p>
          <div
              className={cn('avatar-image')}
              onClick={() => setIsVisible(!isVisible)}
          >
            <img src={userImage} alt="user-image" className={cn('image')}/>
            <i className="fa-solid fa-angle-down"></i>
          </div>

          <div
              className={cn('dropdown')}
              style={{ display: isVisible ? "block" : "none" }}
          >
            {
                role === "ROLE_TEACHER" &&
                <p className={cn('dropdown-item')}>Cập nhật thông tin</p>
            }
            <p className={cn('dropdown-item')}>Đổi mật khẩu</p>
            <p
                className={cn('dropdown-item')}
                onClick={() => signOut()}
            >Đăng xuất</p>
          </div>
        </div>
      </Navbar>
    </>
  );

};

export default NavigationBar;