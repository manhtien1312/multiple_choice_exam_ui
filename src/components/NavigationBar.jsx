/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import routeName from '../config/routename';
import '../assets/css/NavigationBar.css';

const NavigationBar = ({ activeKey }) => {

  return (
    <>
      <Navbar className='navbar bg-body-tertiary' expand="lg">
        <Container className='main-navbar'>
          <Navbar.Brand className='app-name' href={routeName.home}>Trắc nghiệm trực tuyến</Navbar.Brand>
          <Navbar.Collapse className='collapse' id="basic-navbar-nav">
            <Nav className='nav'
              activeKey={activeKey}
            >
              <Nav.Link className='nav-link' href={routeName.home}>Trang chủ</Nav.Link>
              <Nav.Link className='nav-link' href={routeName.class}>Lớp học</Nav.Link>
              <Nav.Link className='nav-link' href={routeName.teacher}>Giáo viên</Nav.Link>
              <Nav.Link className='nav-link' href={routeName.student}>Sinh viên</Nav.Link>
              <Nav.Link className='nav-link' href={routeName.subject}>Môn học</Nav.Link>
            </Nav>
          </Navbar.Collapse>

        </Container>
      </Navbar>
    </>
  );

};

export default NavigationBar;