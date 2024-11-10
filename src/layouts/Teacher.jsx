import {useEffect, useState} from 'react';
import NavigationBar from '../components/NavigationBar';
import routeName from '../config/routename';
import classNames from "classnames/bind";
import styles from '../assets/css/Teacher.module.scss';
import axios from "axios";
import TeacherItem from "../components/TeacherItem.jsx";
import Popup from "../components/Popup.jsx";

const cn = classNames.bind(styles);

const Teacher = () => {

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

    const [popup, setPopup] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [newTeacher, setNewTeacher] = useState({});
    const [message, setMessage] = useState('');

    const getTeachers = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/teacher");
        setTeachers(res.data);
    }

    const handleAddTeacher = async () => {
        const res = await axios.post("http://localhost:8080/api/v1/teacher", newTeacher);
        setMessage(res.data.message);
        setPopup(false);
    }

    const closePopup = () => {
        setPopup(false);
    }

    const handleUploadTeacherFile = async (e) => {
        const teacherFile = e.target.files[0];
        if (!teacherFile) {return null}

        const formData = new FormData();
        formData.append("teacherFile", teacherFile);

        try{
            const res = await axios.post("http://localhost:8080/api/v1/teacher/add-excel",
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            setMessage(res.data.message);
        }
        catch (error){
            console.log(error);
        }
    }

    useEffect(() => {
        getTeachers()
        if(message !== ""){
            alert(message);
        }
    }, [message]);

    return (
        <>
            <NavigationBar activeKey={routeName.teacher}/>

            <div className={cn('main-page')}>

                <div className={cn('container')}>
                    <h1 className={cn('header')}>Danh sách giáo viên</h1>
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
                                <option value="teacherCode">Mã giáo viên</option>
                                <option value="teacherName">Tên giáo viên</option>
                            </select>
                        </div>

                        <div>
                            <button
                                className={cn('btn-add')}
                                onClick={() => setPopup(true)}
                            >Thêm giáo viên
                            </button>
                            <button
                                className={cn('btn-import-file')}
                                onClick={() => {
                                    document.getElementById("fileInput").click()
                                }}
                            >Import <i className="fa-regular fa-file-excel"></i>
                            </button>
                            <input
                                type="file" id="fileInput"
                                style={{display: 'none'}}
                                onChange={(e) => {
                                    handleUploadTeacherFile(e)
                                }}
                            />
                        </div>
                    </div>

                    <div className={cn('list')}>
                        {
                            teachers.map((teacher, index) => (
                                <TeacherItem teacher={teacher} key={index} />
                            ))
                        }
                    </div>
                </div>
            </div>

            {
                popup &&
                <Popup onClick={() => closePopup()}>
                    <div className={cn('add-teacher-form')}>
                        <div className={cn('form-header')}>
                            <h1 className={cn('title-add-teacher')}>Thêm giáo viên</h1>
                            <i className="fa-regular fa-circle-xmark" onClick={() => closePopup()}></i>
                        </div>

                        <input
                            className={cn('input-teacher')}
                            name='teacher-code'
                            type='text'
                            placeholder='Mã giáo viên'
                            autoComplete="off"
                            onChange={(e) => {
                                setNewTeacher({ ...newTeacher, teacherCode: e.target.value });
                            }}
                        />

                        <input
                            className={cn('input-teacher')}
                            name='teacher-name'
                            type='text'
                            placeholder='Họ và tên'
                            autoComplete="off"
                            onChange={(e) => {
                                setNewTeacher({ ...newTeacher, teacherName: e.target.value });
                            }}
                        />

                        <input
                            className={cn('input-teacher')}
                            name='teacher-phoneNumber'
                            type='text'
                            placeholder='Số điện thoại'
                            autoComplete="off"
                            onChange={(e) => {
                                setNewTeacher({ ...newTeacher, phoneNumber: e.target.value });
                            }}
                        />

                        <input
                            className={cn('input-teacher')}
                            name='teacher-email'
                            type='text'
                            placeholder='Email'
                            autoComplete="off"
                            onChange={(e) => {
                                setNewTeacher({ ...newTeacher, email: e.target.value });
                            }}
                        />


                        <button
                            className={cn('btn-add-teacher')}
                            onClick={() => handleAddTeacher()}
                        >
                            Thêm
                        </button>
                    </div>
                </Popup>
            }
        </>
    );
};

export default Teacher;