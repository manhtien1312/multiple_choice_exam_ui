import classNames from "classnames/bind";
import styles from "../assets/css/Notification.module.scss";

const cn = classNames.bind(styles);

const Notificattion = (prop) => {
    return (
      <div className={cn("notification-content")}>
        {prop.response.status === "success" ? (
          <i
            className="fa-solid fa-circle-check"
            style={{ color: "#63E6BE" }}
          ></i>
        ) : (
          <i
            className="fa-solid fa-circle-xmark"
            style={{ color: "#E10E19" }}
          ></i>
        )}
        <p>{prop.response.message}</p>
      </div>
    );
};

export default Notificattion;