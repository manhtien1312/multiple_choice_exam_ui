import NavigationBar from '../components/NavigationBar';
import routeName from '../config/routename';

const HomePage = () => {

  return (
    <>
      <NavigationBar activeKey={routeName.home}/>
    </>
  );

};

export default HomePage;