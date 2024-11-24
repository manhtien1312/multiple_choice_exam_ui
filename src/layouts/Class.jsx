import {useEffect, useState, useRef} from 'react';
import NavigationBar from '../components/NavigationBar';
import Popup from "../components/Popup.jsx";
import routeName from '../config/routename';
import noClassImg from '../assets/images/no-classes.svg';
import classNames from "classnames/bind";
import styles from "../assets/css/Class.module.scss";
import axios from "axios";
import {Link} from "react-router-dom";


const cn = classNames.bind(styles);

const Class = () => {

    axios.interceptors.request.use(
        config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    )

    const role = localStorage.getItem("role");

    const elementRef = useRef(null);

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [newClass, setNewClass] = useState({ teacherName: "" });

    const [popup, setPopup] = useState(false);
    const [message, setMessage] = useState('');
    const [focused, setFocused] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const getClasses = async () => {
        let res = {};
        switch (role) {
            case "ROLE_ADMIN":
                res = await axios.get("http://localhost:8080/api/v1/class");
                break;
            case "ROLE_TEACHER":
                res = await axios.get("http://localhost:8080/api/v1/class/teacher-class");
                break;
            case "ROLE_STUDENT":
                res = await axios.get("http://localhost:8080/api/v1/class/student-class");
                break;
            default:
                break;
        }
        setClasses(res.data);
    }

    const getSubjects = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/subject");
        setSubjects(res.data);
    }

    const getTeacher = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/teacher");
        setTeachers(res.data);
    }

    const openAddClassForm = () => {
        getSubjects();
        getTeacher();
        setPopup(true);
    }

    const closePopup = () => {
        setPopup(false);
    }

    const handleCreateClass = async () => {
        const res = await axios.post("http://localhost:8080/api/v1/class", newClass);
        setMessage(res.data.message);
        setPopup(false);
    }

    const toggleVisibility = (e) => {
        e.preventDefault();
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

    useEffect(() => {
        getClasses();
        if(message !== ""){
            alert(message);
        }
    }, [message])

    return (
        <>
            <NavigationBar activeKey={routeName.class}/>

            <div className={cn('main-page')}>

                <div className={cn('container')}>
                    {
                        role === "ROLE_ADMIN" ?
                        <h1 className={cn('header')}>
                            Tất cả lớp học
                        </h1>
                        :
                        <h1 className={cn('header')}>
                            Lớp học của bạn
                        </h1>
                    }

                    {
                        classes.length === 0 ?
                            <div className={cn('no-classes-notification')}>
                                <img src={noClassImg} alt="no-classes"/>
                                {
                                    role === "ROLE_ADMIN" && 
                                        <>
                                            <p>Chưa có lớp học trong hệ thống</p>
                                            <button
                                                className={cn('btn-add-class')}
                                                onClick={() => openAddClassForm()}
                                            >Tạo lớp học
                                            </button>
                                        </>
                                }
                                {
                                    role === "ROLE_TEACHER" && <p>Bạn chưa có lớp học nào</p>
                                }
                                {
                                    role === "ROLE_STUDENT" && <p>Bạn chưa tham gia lớp học nào</p>
                                }
                            </div>
                            :
                            <div>
                                <div className={cn('action')}>
                                    <div className={cn('filter')}>
                                        <input
                                            className={cn('search-box')}
                                            name='search'
                                            type='text'
                                            placeholder='Tìm kiếm'
                                            autoComplete="off"/>

                                        <select
                                            name='sort-condition'
                                            className={cn('sort-box')}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>--Sắp xếp--</option>
                                            <option value="className">Tên lớp</option>
                                            <option value="subject">Môn học</option>
                                        </select>
                                    </div>

                                    {
                                        role === "ROLE_ADMIN" &&
                                        <button
                                            className={cn('btn-add-class')}
                                            onClick={() => openAddClassForm()}
                                        >Tạo lớp học
                                        </button>
                                    }
                                </div>

                                <div className={cn('list')}>
                                    {
                                        classes.map((classDto) => (
                                            <Link key={classDto.id} className={cn('list-item')}
                                                  to={`/class/${classDto.id}`}>
                                                {
                                                    role === "ROLE_ADMIN" ?
                                                    <div className={cn('information')}>
                                                        <p className={cn('class-name')}>{classDto.subject} - {classDto.className}</p>
                                                        <p className={cn('subject-name')}>Giáo viên: {classDto.teacherName}</p>
                                                    </div>
                                                    :
                                                    <div className={cn('information')}>
                                                        <p className={cn('class-name')}>{classDto.className}</p>
                                                        <p className={cn('subject-name')}>{classDto.subject}</p>
                                                    </div>
                                                }
                                            </Link>
                                        ))
                                    }
                                </div>
                            </div>
                    }
                </div>

                {
                    popup &&
                    <Popup onClick={() => closePopup()}>
                        <div className={cn('add-class-form')}>
                            <div className={cn('form-header')}>
                                <h1 className={cn('title-add-class')}>Tạo lớp học</h1>
                                <i className="fa-regular fa-circle-xmark" onClick={() => closePopup()}></i>
                            </div>

                            <select
                                className={cn('input-class')}
                                name="select-subject"
                                defaultValue=""
                                onChange={(e) => {
                                    setNewClass({...newClass, subject: e.target.value});
                                }}
                            >
                                <option value="" hidden>Chọn môn học</option>
                                {
                                    subjects.map((subject, index) => (
                                        <option key={index} value={subject.subjectName}>{subject.subjectName}</option>
                                    ))
                                }
                            </select>

                            <div className={cn('select-teacher')}>
                                <input
                                    className={cn('input-class')}
                                    name='teacher-name'
                                    type='text'
                                    placeholder='Giáo viên'
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    autoComplete="off"
                                    value={newClass.teacherName}
                                    onChange={(e) => {
                                        setNewClass({...newClass, teacherName: e.target.value});
                                    }}
                                />
                                {
                                    focused &&
                                    <div className={cn('list-teacher')}>
                                        {
                                            teachers.map((teacher) => (
                                                <div 
                                                    key={teacher.id}
                                                    onMouseDown={() => {
                                                        setNewClass({ ...newClass, teacherName: teacher.teacherName })
                                                    }}
                                                >
                                                    {teacher.teacherCode} - {teacher.teacherName}
                                                </div>
                                            ))
                                        }
                                    </div>
                                }
                            </div>

                            <input
                                className={cn('input-class')}
                                name='class-name'
                                type='text'
                                placeholder='Tên lớp'
                                autoComplete="off"
                                onChange={(e) => {
                                    setNewClass({...newClass, className: e.target.value});
                                }}
                            />

                            <button
                                className={cn('btn-add-class')}
                                onClick={() => {
                                    handleCreateClass()
                                }}
                            >
                                Tạo lớp
                            </button>
                        </div>
                    </Popup>
                }
            </div>
        </>
    );
};

export default Class;