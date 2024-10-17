import React from 'react';
import NavigationBar from '../components/NavigationBar';
import routeName from '../config/routename';

const Class = () => {
  return (
    <>
      <NavigationBar activeKey={routeName.class}/>
    </>
  );
};

export default Class;