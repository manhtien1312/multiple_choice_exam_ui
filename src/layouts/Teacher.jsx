import React from 'react';
import NavigationBar from '../components/NavigationBar';
import routeName from '../config/routename';

const Teacher = () => {
  return (
    <>
      <NavigationBar activeKey={routeName.teacher}/>
    </>
  );
};

export default Teacher;