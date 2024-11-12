import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Popup from '../components/Popup.jsx';
import classNames from 'classnames/bind';
import styles from '../assets/css/ExamQuestionDetail.module.scss'
import axios from 'axios';

const cn = classNames.bind(styles);

const ExamQuestionDetail = () => {

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

    const { examQuestionId } = useParams();

    const [examQuestion, setExamQuestion] = useState({});
    const [listQuestion, setListQuestion] = useState([]);
    const [subject, setSubject] = useState({});
    const [change, setChange] = useState(false);
    const [questionBank, setQuestionBank] = useState([]);
    const [changeQuestionRequest, setChangeQuestionRequest] = useState({});
    const [popup, setPopup] = useState(false);

    const getExamQuestion = async () => {
        const res = await axios.get(`http://localhost:8080/api/v1/exam-question/${examQuestionId}`);
        setSubject(res.data.subject)
        setListQuestion(res.data.questions);
        setExamQuestion(res.data);
        setChangeQuestionRequest({ ...changeQuestionRequest, examQuestionId: res.data.id })
    }

    const getQuestionBank = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/question-bank", {
            params: {
                subjectId: subject.id,
                type: 1,
            },
        });
        setQuestionBank(res.data.questions);
    }

    const handleChangeQuestion = async () => {
        const res = await axios.put("http://localhost:8080/api/v1/exam-question/change-question", changeQuestionRequest);
        alert(res.data.message);
        window.location.reload();
    }

    useEffect(() => {
        getExamQuestion();
    }, []);

    return (
        <>
            <NavigationBar />

            <div className={cn('main-page')}>
                <div className={cn('header')}>
                    <h1 className={cn('title')}>{subject.subjectName}</h1>
                    <p>{subject.subjectCode}</p>
                </div>

                {
                    !change &&
                    <div className={cn('content')}>
                        <div className={cn('detail')}>
                            <p className={cn('code')}>Mã đề: {examQuestion.examQuestionCode}</p>
                            <p className={cn('total-question')}>{examQuestion.totalQuestions} câu hỏi</p>
                        </div>

                        <div className={cn('list-question')}>
                            {
                                listQuestion.map((question) => (
                                        <div key={question.id} className={cn("question-item-container")}>
                                            <div className={cn('head')}>
                                                <p>Câu {question.questionCode.substr(2, question.questionCode.length-2)}</p>
                                                <div className={cn('question-action')}>
                                                    <button
                                                        onClick={() => {
                                                            setChangeQuestionRequest({ ...changeQuestionRequest, oldQuestion: question })
                                                            getQuestionBank();
                                                            setChange(true)
                                                        }}
                                                    ><i className="fa-solid fa-rotate"></i>
                                                    Đổi câu hỏi</button>
                                                </div>
                                            </div>

                                            <div className={cn('question-content')}>
                                                <p>{question.questionContent}</p>
                                            </div>

                                            <div className={cn('answers')}>
                                                {
                                                    question.answers.map((answer) => (
                                                        <div key={answer.id} className={cn('answer-content')}>
                                                            { 
                                                                answer.isCorrect 
                                                                ? <i className="fa-solid fa-check" style={{color: "#63E6BE"}}></i>
                                                                : <i className="fa-solid fa-xmark" style={{color: "#f50505"}}></i>
                                                            }
                                                            <p>{answer.answerContent}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                ))
                            }
                        </div>
                    </div>
                }

                {
                    change &&
                    <div className={cn('content')}>
                        <div className={cn('detail')}>
                            <p className={cn('code')}>Đổi câu hỏi: {changeQuestionRequest.oldQuestion.questionCode.substr(2, changeQuestionRequest.oldQuestion.questionCode.length-2)}</p>
                            <button onClick={() => {setChange(false)}}>Hủy</button>
                        </div>

                        <div className={cn('list-question')}>
                            {
                                questionBank.map((question) => ( (!listQuestion.some(examQuestion => examQuestion.id === question.id)) &&
                                        <div key={question.id} className={cn("question-item-container")}>
                                            <div className={cn('head')}>
                                                <p>Câu {question.questionCode.substr(2, question.questionCode.length-2)}</p>
                                                <div className={cn('question-action')}>
                                                    <button
                                                        onClick={() => {
                                                            setChangeQuestionRequest({ ...changeQuestionRequest,
                                                                newQuestion: question
                                                             })
                                                            setPopup(true);
                                                        }}
                                                    ><i className="fa-solid fa-rotate"></i>
                                                    Thay đổi</button>
                                                </div>
                                            </div>

                                            <div className={cn('question-content')}>
                                                <p>{question.questionContent}</p>
                                            </div>

                                            <div className={cn('answers')}>
                                                {
                                                    question.answers.map((answer) => (
                                                        <div key={answer.id} className={cn('answer-content')}>
                                                            { 
                                                                answer.isCorrect 
                                                                ? <i className="fa-solid fa-check" style={{color: "#63E6BE"}}></i>
                                                                : <i className="fa-solid fa-xmark" style={{color: "#f50505"}}></i>
                                                            }
                                                            <p>{answer.answerContent}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                ))
                            }
                        </div>
                    </div>
                }
            </div>

            {   
                popup &&
                <Popup onClick={() => setPopup(false)}>
                    <div className={cn('change-question-form')}>
                        <div className={cn('form-header')}>
                            <h1 className={cn('title-change-question')}>
                                Đổi câu hỏi: {changeQuestionRequest.oldQuestion.questionCode.substr(2, changeQuestionRequest.oldQuestion.questionCode.length-2)} sang {changeQuestionRequest.newQuestion.questionCode.substr(2, changeQuestionRequest.newQuestion.questionCode.length-2)}
                            </h1>
                        </div>

                        <div className={cn('action-btn')}>
                            <button
                                className={cn('btn-cancel')}
                                onClick={() => setPopup(false)}
                            >Hủy
                            </button>
                            <button
                                className={cn('btn-change')}
                                onClick={() => {handleChangeQuestion()}}
                            >Thay đổi
                            </button>
                                
                        </div>
                    </div>
                </Popup>
            }
        </>
    );
};

export default ExamQuestionDetail;