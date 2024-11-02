import {useEffect, useRef, useState} from "react";
import userImage from "../assets/images/user.png";
import classNames from "classnames/bind";
import styles from "../assets/css/TeacherItem.module.scss";
import Popup from "./Popup.jsx";
import axios from "axios";

const cn = classNames.bind(styles);

const TeacherItem = (prop) => {

    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [popup, setPopup] = useState(false);
    const [teacher, setTeacher] = useState({});
    const [editable, setEditable] = useState(false);

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

    const handleSaveTeacher = async () => {
        const res = await axios.put(`http://localhost:8080/api/v1/teacher/${prop.teacher.id}`, teacher);
        alert(res.data.message);
        setPopup(false);
        window.location.reload();
    }

    const handleDeleteTeacher = async (e) => {
        e.stopPropagation();
        const res = await axios.delete(`http://localhost:8080/api/v1/teacher/${prop.teacher.id}`);
        alert(res.data.message);
        window.location.reload();
    }

    return (
        <>
            <div onClick={() => setPopup(true)} className={cn('list-item')}>
                <div className={cn('image')}>
                    <img src={userImage} alt='teacher-image'/>
                </div>

                <div className={cn('information')}>
                    <p className={cn('teacher-name')}>{prop.teacher.teacherName}</p>
                    <p className={cn('teacher-code')}>{prop.teacher.teacherCode}</p>
                </div>

                <div className={cn('action')}>
                    <button onClick={(e) => toggleVisibility(e)}>
                        <i className="fa-solid fa-ellipsis-vertical"></i>
                    </button>
                    {
                        isVisible &&
                        <div ref={elementRef} className={cn('action-dropdown')}>
                            <p
                                className={cn('dropdown-item')}
                                onClick={(e) => {
                                    toggleVisibility(e);
                                    setPopup(true);
                                }}
                            >Xem chi tiết</p>
                            <p
                                className={cn('dropdown-item')}
                                onClick={(e) => handleDeleteTeacher(e)}
                            >Xóa</p>
                        </div>
                    }
                </div>
            </div>

            {
                popup &&
                <Popup onClick={() => closePopup()}>
                    <div className={cn('add-teacher-form')}>
                        <div className={cn('form-header')}>
                            <h1 className={cn('title-add-teacher')}>Thông tin giáo viên</h1>
                            <i className="fa-regular fa-circle-xmark" onClick={() => closePopup()}></i>
                        </div>

                        <input
                            className={cn('input-teacher')}
                            name='teacher-code'
                            type='text'
                            placeholder='Mã giáo viên'
                            autoComplete="off"
                            defaultValue={prop.teacher.teacherCode}
                            disabled={!editable}
                            onChange={(e) => {
                                setTeacher({ ...teacher, teacherCode: e.target.value });
                            }}
                        />

                        <input
                            className={cn('input-teacher')}
                            name='teacher-name'
                            type='text'
                            placeholder='Họ và tên'
                            autoComplete="off"
                            defaultValue={prop.teacher.teacherName}
                            disabled={!editable}
                            onChange={(e) => {
                                setTeacher({ ...teacher, teacherName: e.target.value });
                            }}
                        />

                        <input
                            className={cn('input-teacher')}
                            name='teacher-phoneNumber'
                            type='text'
                            placeholder='Số điện thoại'
                            autoComplete="off"
                            defaultValue={prop.teacher.phoneNumber}
                            disabled={!editable}
                            onChange={(e) => {
                                setTeacher({ ...teacher, phoneNumber: e.target.value });
                            }}
                        />

                        <input
                            className={cn('input-teacher')}
                            name='teacher-email'
                            type='text'
                            placeholder='Email'
                            autoComplete="off"
                            defaultValue={prop.teacher.email}
                            disabled={!editable}
                            onChange={(e) => {
                                setTeacher({ ...teacher, email: e.target.value });
                            }}
                        />

                        <div className={cn('action-btn')}>
                            {
                                editable ?
                                <>
                                    <button
                                        className={cn('btn-action')}
                                        onClick={() => handleSaveTeacher()}
                                    >Lưu
                                    </button>
                                    <button
                                        className={cn('btn-cancel')}
                                        onClick={() => closePopup()}
                                    >Hủy
                                    </button>
                                </>
                                :
                                <button
                                    className={cn('btn-action')}
                                    onClick={() => setEditable(true)}
                                >Sửa
                                </button>
                            }
                        </div>
                    </div>
                </Popup>
            }
        </>
    );
};

export default TeacherItem;