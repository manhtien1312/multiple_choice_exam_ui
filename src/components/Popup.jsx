import classNames from 'classnames/bind';
import styles from '../assets/css/Popup.module.scss';

const cn = classNames.bind(styles);

const Popup = (prop) => {
    return (
        <div className={cn('popup')}>
            <div className={cn('overlay')} onClick={prop.onClick}></div>
            <div className={cn('popup-content')}>
                {prop.children}
            </div>
        </div>
    );
};

export default Popup;