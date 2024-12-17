import {useEffect, useRef, useState} from "react";

import userImage from "../assets/images/user.png";
import Notificattion from '../components/Notificattion.jsx';
import Popup from "./Popup.jsx";

import classNames from "classnames/bind";
import styles from "../assets/css/TeacherItem.module.scss";
import axios from "axios";

const cn = classNames.bind(styles);

const TeacherItem = (prop) => {

    const elementRef = useRef(null);

    const [teacher, setTeacher] = useState(prop.teacher);
    
    const [popup, setPopup] = useState(false);
    const [focused, setFocused] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [editable, setEditable] = useState(false);
    const [validateInput, setValidateInput] = useState({
        validTeacherCode: false,
        teacherCode: false,
        teacherName: false,
        phoneNum: false,
        email: false,
        major: false
    });
    const [response, setResponse] = useState({
        status: "",
        message: ""
    });

    const toggleVisibility = (e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
    };

    const handleClickOutside = (e) => {
        if (elementRef.current && !elementRef.current.contains(e.target)) {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const closePopup = () => {
        setPopup(false);
        setEditable(false);
    }

    const validate = () => {
        setValidateInput({
          teacherCode: teacher.teacherCode === "",
          teacherName: teacher.teacherName === "",
          phoneNum: teacher.phoneNumber === "",
          email: teacher.email === "",
          major: teacher.major.majorName === ""
        });
  
        if (
          teacher.teacherCode !== "" &&
          teacher.teacherName !== "" &&
          teacher.phoneNumber !== "" &&
          teacher.email !== "" &&
          teacher.major.majorName !== ""
        ) {
          return true;
        } else {
          return false;
        }
      }

    const handleSaveTeacher = async () => {
        try {
            if(validate()){
                const res = await axios.put(`http://localhost:8080/api/v1/teacher/${prop.teacher.id}`, teacher);
                setResponse({status: "success", message: res.data.message});
                setTimeout(() => setResponse({status: "", message: ""}), 3000);
                setPopup(false);
                prop.reload();
            }
        } catch (error) {
            setValidateInput({ ...validateInput,
                validTeacherCode: true,
                teacherCode: teacher.teacherCode === "",
                teacherName: teacher.teacherName === "",
                phoneNum: teacher.phoneNumber === "",
                email: teacher.email === "",
                major: teacher.major.majorName === ""
            });
            setResponse({status: "failure", message: error.response.data.message});
            setTimeout(() => setResponse({ status: "", message: "" }), 3000);
        }
    }

    const handleDeleteTeacher = async (e) => {
        e.stopPropagation();
        const res = await axios.delete(`http://localhost:8080/api/v1/teacher/${prop.teacher.id}`);
        setResponse({status: "success", message: res.data.message});
        prop.reload();
        setTimeout(() => setResponse({status: "", message: ""}), 3000);
    }

    return (
      <>
        {response.message && <Notificattion response={response} />}

        <div onClick={() => setPopup(true)} className={cn("list-item")}>
          <div className={cn("image")}>
            <img src={userImage} alt="teacher-image" />
          </div>

          <div className={cn("information")}>
            <p className={cn("teacher-name")}>{prop.teacher.teacherName}</p>
            <p className={cn("teacher-code")}>{prop.teacher.teacherCode}</p>
            <p className={cn("teacher-code")}>{prop.teacher.major.majorName}</p>
          </div>

          <div className={cn("action")}>
            <button onClick={(e) => toggleVisibility(e)}>
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            {isVisible && (
              <div ref={elementRef} className={cn("action-dropdown")}>
                <p
                  className={cn("dropdown-item")}
                  onClick={(e) => {
                    toggleVisibility(e);
                    setPopup(true);
                  }}
                >
                  Xem chi tiết
                </p>
                <p
                  className={cn("dropdown-item")}
                  onClick={(e) => handleDeleteTeacher(e)}
                >
                  Xóa
                </p>
              </div>
            )}
          </div>
        </div>

        {popup && (
          <Popup onClick={() => closePopup()}>
            <div className={cn("add-teacher-form")}>
              <div className={cn("form-header")}>
                <h1 className={cn("title-add-teacher")}>Thông tin giáo viên</h1>
                <i
                  className="fa-regular fa-circle-xmark"
                  onClick={() => closePopup()}
                ></i>
              </div>

              <div className={cn("label")}>
                <div>
                  <label>Mã giáo viên</label>
                  <span>*</span>
                </div>
                {validateInput.validTeacherCode && (
                  <p className={cn("validate-input")}>
                    Mã giáo viên đã tồn tại
                  </p>
                )}
                {validateInput.teacherCode && (
                  <p className={cn("validate-input")}>
                    Mã giáo viên không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-teacher")}
                name="teacher-code"
                type="text"
                placeholder="Mã giáo viên"
                autoComplete="off"
                defaultValue={prop.teacher.teacherCode}
                disabled
                onChange={(e) => {
                  setTeacher({ ...teacher, teacherCode: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Họ và tên</label>
                  <span>*</span>
                </div>
                {validateInput.teacherName && (
                  <p className={cn("validate-input")}>
                    Họ tên giáo viên không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-teacher")}
                name="teacher-name"
                type="text"
                placeholder="Họ và tên"
                autoComplete="off"
                defaultValue={prop.teacher.teacherName}
                disabled={!editable}
                onChange={(e) => {
                  setTeacher({ ...teacher, teacherName: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Số điện thoại</label>
                  <span>*</span>
                </div>
                {validateInput.phoneNum && (
                  <p className={cn("validate-input")}>
                    Số điện thoại không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-teacher")}
                name="teacher-phoneNumber"
                type="text"
                placeholder="Số điện thoại"
                autoComplete="off"
                defaultValue={prop.teacher.phoneNumber}
                disabled={!editable}
                onChange={(e) => {
                  setTeacher({ ...teacher, phoneNumber: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Email</label>
                  <span>*</span>
                </div>
                {validateInput.email && (
                  <p className={cn("validate-input")}>Email không được trống</p>
                )}
              </div>
              <input
                className={cn("input-teacher")}
                name="teacher-email"
                type="text"
                placeholder="Email"
                autoComplete="off"
                defaultValue={prop.teacher.email}
                disabled={!editable}
                onChange={(e) => {
                  setTeacher({ ...teacher, email: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Khoa/ngành</label>
                  <span>*</span>
                </div>
                {validateInput.major && (
                  <p className={cn("validate-input")}>
                    Khoa/ngành không được trống
                  </p>
                )}
              </div>
              <div className={cn("select-major")}>
                <input
                  name="teacher-major"
                  type="text"
                  placeholder="Chọn khoa/ngành"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoComplete="off"
                  value={teacher.major.majorName}
                  disabled={!editable}
                  onChange={(e) =>
                    setTeacher({
                      ...teacher,
                      major: { majorName: e.target.value },
                    })
                  }
                />
                {focused && (
                  <div className={cn("list-major")}>
                    {prop.majors.map((major) => (
                      <div
                        key={major.id}
                        onMouseDown={() =>
                          setTeacher({ ...teacher, major: major })
                        }
                      >
                        {major.majorName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={cn("action-btn")}>
                {editable ? (
                  <>
                    <button
                      className={cn("btn-action")}
                      onClick={() => handleSaveTeacher()}
                    >
                      Lưu
                    </button>
                    <button
                      className={cn("btn-cancel")}
                      onClick={() => closePopup()}
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    className={cn("btn-action")}
                    onClick={() => setEditable(true)}
                  >
                    Sửa
                  </button>
                )}
              </div>
            </div>
          </Popup>
        )}
      </>
    );
};

export default TeacherItem;