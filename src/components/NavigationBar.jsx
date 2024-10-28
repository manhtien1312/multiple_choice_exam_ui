/* eslint-disable react/prop-types */
import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import routeName from '../config/routename';
import classNames from 'classnames/bind';
import styles from '../assets/css/NavigationBar.module.scss';

const cn = classNames.bind(styles);

const NavigationBar = (prop) => {

  return (
    <>
      <Navbar className={cn('navbar')} expand="lg">
        <Container className={cn('main-navbar')}>
          <Navbar.Brand className={cn('app-name')}
                        href={routeName.home}>
            Trắc nghiệm trực tuyến
          </Navbar.Brand>
          <Navbar.Collapse className={cn('collapse')}
                           id="basic-navbar-nav">
            <Nav className={cn('nav')}
              activeKey={prop.activeKey}
            >
              <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.home })} href={routeName.home}>Trang chủ</Nav.Link>
              <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.class})} href={routeName.class}>Lớp học</Nav.Link>
              <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.teacher })} href={routeName.teacher}>Giáo viên</Nav.Link>
              <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.student })} href={routeName.student}>Sinh viên</Nav.Link>
              <Nav.Link className={cn('nav-link', { active: prop.activeKey === routeName.subject })} href={routeName.subject}>Môn học</Nav.Link>
            </Nav>
          </Navbar.Collapse>

        </Container>
      </Navbar>
    </>
  );

};

export default NavigationBar;