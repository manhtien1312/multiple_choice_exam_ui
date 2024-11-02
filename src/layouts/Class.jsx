import {useEffect, useState} from 'react';
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

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [newClass, setNewClass] = useState({});
    const [popup, setPopup] = useState(false);
    const [message, setMessage] = useState('');

    const sortConditionArr = ["className", "subject"];

    const getClasses = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/class/teacher-class");
        setClasses(res.data);
    }

    const getSubjects = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/subject");
        setSubjects(res.data);
    }

    const openAddClassForm = () => {
        getSubjects();
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

    useEffect(() => {
        getClasses();
    }, [message])

    return (
        <>
            <NavigationBar activeKey={routeName.class}/>

            <div className={cn('main-page')}>

                <div className={cn('container')}>
                    <h1 className={cn('header')}>Lớp học của bạn</h1>

                    {
                        classes.length === 0 ?
                            <div className={cn('no-classes-notification')}>
                                <img src={noClassImg} alt="no-classes"/>
                                <p>Bạn chưa có một lớp học nào</p>
                                <button
                                    className={cn('btn-add-class')}
                                    onClick={() => openAddClassForm()}
                                >Tạo lớp mới
                                </button>
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
                                            {
                                                sortConditionArr.map((condition, index) => (
                                                    <option
                                                        key={index}
                                                        value={condition}
                                                    >
                                                        {condition === "className" ? "Tên lớp" : "Môn học"}
                                                    </option>
                                                ))
                                            }
                                        </select>
                                    </div>

                                    <button
                                        className={cn('btn-add-class')}
                                        onClick={() => openAddClassForm()}
                                    >Tạo lớp mới
                                    </button>
                                </div>

                                <div className={cn('list')}>
                                    {
                                        classes.map((classDto, index) => (
                                            <Link key={index} className={cn('list-item')}
                                                  to={`/class/${classDto.id}`}>
                                                <div className={cn('information')}>
                                                    <p className={cn('class-name')}>{classDto.className}</p>
                                                    <p className={cn('subject-name')}>{classDto.subject}</p>
                                                </div>
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