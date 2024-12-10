import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Popup from '../components/Popup.jsx';
import axios from 'axios';
import classNames from 'classnames/bind';
import styles from '../assets/css/ExamQuestionBank.module.scss'

const cn = classNames.bind(styles);

const ExamQuestionBankTable = (prop) => {

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

    const [listExamQuestion, setListExamQuestion] = useState([]);
    const [popup, setPopup] = useState(false);
    const [examQuestionDetail, setExamQuestionDetail] = useState([]);
    const [createRequest, setCreateRequest] = useState({ subjectId: prop.subjectId });
    const [message, setMessage] = useState("");

    const getListExamQuestion = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/exam-question", {
            params: {
                subjectId: prop.subjectId
            }
        });
        setListExamQuestion(res.data);
    }

    const getListType = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/question-type", {
            params: {
                subjectId: prop.subjectId
            }
        });
        setExamQuestionDetail(res.data.map((type) => ({
            ...type,
            numberOfQuestions: 0
        })))
    }

    const handleChangeDetail = (index, e) => {
        const updatedDetail = [ ...examQuestionDetail ];
        updatedDetail[index].numberOfQuestions = parseInt(e.target.value, 10);
        setExamQuestionDetail(updatedDetail);
        setCreateRequest({ ...createRequest, details: updatedDetail })
    }

    const handleCreateExamQuestion = async () => {
        const res = await axios.post("http://localhost:8080/api/v1/exam-question/create", createRequest);
        setMessage(res.data.message);
        setPopup(false);
    }

    useEffect(() => {
        getListExamQuestion();
        getListType();

        if(message !== ""){
            alert(message);
        }
    }, [message])

    return (
        <>
            <div className={cn('action')}>
                <div className={cn('filter')}>
                    <input
                        className={cn('search-box')}
                        name='search'
                        type='text'
                        placeholder='Tìm kiếm'
                        autoComplete="off"/>
                </div>

                <div>
                    <button
                        className={cn('btn-add')}
                        onClick={() => setPopup(true)}
                    >Tạo đề thi
                    </button>
                </div>
            </div>

            <div className={cn('list')}>
                {
                    listExamQuestion.map((examQuestion) => (
                        <Link key={examQuestion.id} className={cn('list-item')}
                            to={`/exam-question/${examQuestion.id}`}>
                            <div className={cn('information')}>
                                <p className={cn('exam-question-code')}>Mã đề: {examQuestion.examQuestionCode}</p>
                                <p className={cn('total-question')}>{examQuestion.totalQuestions} câu</p>
                            </div>
                        </Link>
                    ))
                }
            </div>

            {
                popup &&
                <Popup onClick={() => setPopup(false)} >
                    <div className={cn('create-examquestion-form')}>
                        <div className={cn('form-header')}>
                            <h1 className={cn('title-add-teacher')}>Cấu hình đề thi</h1>
                            <i className="fa-regular fa-circle-xmark" onClick={() => setPopup(false)}></i>
                        </div>

                        <div className={cn('total-question')}>
                            <label>Mã đề thi:</label>
                            <input
                                name='examquestion-code'
                                type='text'
                                autoComplete="off"
                                onChange={(e) => {
                                    setCreateRequest({ ...createRequest, examQuestionCode: e.target.value })
                                }}
                            />
                        </div>

                        <div className={cn('total-question')}>
                            <label>Tổng số câu hỏi:</label>
                            <input
                                name='total-question'
                                type='number'
                                autoComplete="off"
                                onChange={(e) => {
                                    setCreateRequest({ ...createRequest, totalQuestions: parseInt(e.target.value, 10) })
                                }}
                            />
                        </div>

                        <p>Số lượng câu hỏi theo từng loại:</p>

                        {
                            examQuestionDetail.map((type, index) => (
                                <div key={type.id} className={cn('questions-by-type')}>
                                    <label>{type.typeName}:</label>
                                    <input
                                        name='number-questions-type'
                                        type='number'
                                        autoComplete="off"
                                        value={type.numberOfQuestions}
                                        onChange={(e) => {handleChangeDetail(index, e)}}
                                    />
                                </div>
                            ))
                        }

                        <button
                            className={cn('btn-add-teacher')}
                            onClick={() => {handleCreateExamQuestion()}}
                        >
                            Tạo
                        </button>
                    </div>
                </Popup>
            }
        </>
    );
};

export default ExamQuestionBankTable;