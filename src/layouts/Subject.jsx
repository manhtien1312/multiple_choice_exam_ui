import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Popup from '../components/Popup';
import routeName from '../config/routename';
import noSubjectImg from "../assets/images/no-classes.svg";
import classNames from "classnames/bind";
import styles from '../assets/css/Subject.module.scss';
import axios from 'axios';

const cn = classNames.bind(styles);

const Subject = () => {

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
    );

	const [subjects, setSubjects] = useState([]);
	const [popup, setPopup] = useState(false);
	const [newSubject, setNewSubject] = useState({});
	const [message, setMessage] = useState('');

	const getSubjects = async () => {
		const res = await axios.get("http://localhost:8080/api/v1/subject");
		setSubjects(res.data);
	}

	const closePopup = () => {
        setPopup(false);
    }

	const handleAddSubject = async () => {
		try {
			const res = await axios.post("http://localhost:8080/api/v1/subject", newSubject);
			setMessage(res.data.message);
			setPopup(false);
		} catch (error) {
			if(error.response.status === 500){
				console.log(error.response.data);
			}
		}
	}

	useEffect(() => {
		getSubjects();
		if(message !== ""){
            alert(message);
        }
	}, [message]);

    return (
        <>
			<NavigationBar activeKey={routeName.subject}/>

			<div className={cn('main-page')}>

			<div className={cn('container')}>
                    <h1 className={cn('header')}>Tất cả môn học</h1>

                    {
                        subjects.length === 0 ?
                            <div className={cn('no-subjects-notification')}>
                                <img src={noSubjectImg} alt="no-subjects"/>
                                <p>Chưa có môn học nào trong hệ thống</p>
                                <button
                                    className={cn('btn-add-class')}
                                    onClick={() => setPopup(true)}
                                >Thêm môn học
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
                                            
                                        </select>
                                    </div>

                                    <button
                                        className={cn('btn-add-class')}
                                        onClick={() => setPopup(true)}
                                    >Thêm môn học
                                    </button>
                                </div>

                                <div className={cn('list')}>
                                    {
                                        subjects.map((subject, index) => (
                                            <Link key={index} className={cn('list-item')}
                                                  to={`/subject/${subject.id}`}>
                                                <div className={cn('information')}>
                                                    <p className={cn('class-name')}>{subject.subjectName}</p>
                                                    <p className={cn('subject-name')}>{subject.subjectCode}</p>
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
                    <div className={cn('add-subject-form')}>
                            <div className={cn('form-header')}>
                            <h1 className={cn('title-add-subject')}>Thêm môn học</h1>
                                <i className="fa-regular fa-circle-xmark" onClick={() => closePopup()}></i>
                            </div>

                            <input
                                className={cn('input-subject')}
                                name='subject-name'
                                type='text'
                                placeholder='Mã môn học'
                                autoComplete="off"
								onChange={(e) => setNewSubject({ ...newSubject, subjectCode: e.target.value })}
                            />

							<input
                                className={cn('input-subject')}
                                name='subject-code'
                                type='text'
                                placeholder='Tên môn học'
                                autoComplete="off"
								onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                            />

                            <button
                                className={cn('btn-add-subject')}
								onClick={() => handleAddSubject()}
							>Thêm
                            </button>
                        </div>
                    </Popup>
                }
			</div>
        </>
    );
};

export default Subject;