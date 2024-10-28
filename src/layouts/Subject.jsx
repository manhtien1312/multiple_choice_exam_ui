import React from 'react';
import NavigationBar from '../components/NavigationBar';
import routeName from '../config/routename';
import classNames from "classnames/bind";
import styles from '../assets/css/Subject.module.scss';

const cn = classNames.bind(styles);

const Subject = () => {
  return (
    <>
      <NavigationBar activeKey={routeName.subject}/>

      <div className={cn('main-page')}>

        <div className={cn('container')}>

        </div>

      </div>
    </>
  );
};

export default Subject;