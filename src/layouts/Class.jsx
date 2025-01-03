import {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import NavigationBar from '../components/NavigationBar';
import Popup from "../components/Popup.jsx";
import Notificattion from '../components/Notificattion.jsx';

import noClassImg from '../assets/images/no-classes.svg';
import routeName from '../config/routename';
import classNames from "classnames/bind";
import styles from "../assets/css/Class.module.scss";
import axios from "axios";


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

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    // const [teachers, setTeachers] = useState([]);
    const [newClass, setNewClass] = useState({
        subject: "",
        classFile: null
    });

    const [searchText, setSearchText] = useState("");
    const [popup, setPopup] = useState(false);
    const [response, setResponse] = useState({
        status: "",
        message: ""
      });

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

    // const getTeacher = async () => {
    //     const res = await axios.get("http://localhost:8080/api/v1/teacher");
    //     setTeachers(res.data);
    // }

    const openAddClassForm = () => {
        getSubjects();
        // getTeacher();
        setPopup(true);
    }

    const closePopup = () => {
        setPopup(false);
    }

    const handleCreateClass = async () => {
        const formData = new FormData();
        formData.append("subjectName", newClass.subject);
        formData.append("classFile", newClass.classFile);

        try {
            const res = await axios.post("http://localhost:8080/api/v1/class", 
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            setResponse({status: "success", message: res.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
            setPopup(false);
        } catch (error) {
            setResponse({status: "failure", message: error.response.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
        }

    }

    useEffect(() => {
        getClasses();
    }, [response]);

    useEffect(() => {

        if(!searchText){
            getClasses();
            return;
        }

        const delay = setTimeout(async () => {
            const res = await axios.get("http://localhost:8080/api/v1/class/filter", {
                params: {
                    searchText: searchText,
                }
            });
            setClasses(res.data);
        }, 1500);

        return () => clearTimeout(delay);
    }, [searchText]);

    return (
        <>
            <NavigationBar activeKey={routeName.class}/>

            {response.message && <Notificattion response={response} />}

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

                    <div className={cn('action')}>
                        <div className={cn('filter')}>
                            <input
                                className={cn('search-box')}
                                name='search'
                                type='text'
                                placeholder='Tìm kiếm'
                                autoComplete="off"
                                onChange={(e) => setSearchText(e.target.value)}
                            />

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

                    {
                        classes.length === 0 ?
                            <div className={cn('no-classes-notification')}>
                                <img src={noClassImg} alt="no-classes"/>
                                {
                                    role === "ROLE_ADMIN" && <p>Không có lớp học trong hệ thống</p>
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

                            <input
                                className={cn('input-file')}
                                name='file'
                                id='file'
                                type='file'
                                placeholder='Tên lớp'
                                autoComplete="off"
                                onChange={(e) => {
                                    setNewClass({...newClass, classFile: e.target.files[0]});
                                }}
                            />
                            <label htmlFor="file">
                                <i className="fa-solid fa-upload"></i>
                                {
                                    newClass.classFile 
                                    ? newClass.classFile.name 
                                    : "Upload danh sách lớp"
                                }
                            </label>

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