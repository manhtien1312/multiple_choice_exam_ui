import React from 'react';
import NavigationBar from '../components/NavigationBar';
import routeName from '../config/routename';

const Student = () => {
  return (
    <>
      <NavigationBar activeKey={routeName.student}/>
    </>
  );
};

export default Student;