import { useState } from 'react';
import Popup from './Popup.jsx';
import classNames from 'classnames/bind';
import styles from '../assets/css/QuestionItem.module.scss';
import axios from 'axios';

const cn = classNames.bind(styles);

const QuestionItem = (prop) => {

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

    const [question, setQuestion] = useState(prop.question);
    const [answers, setAnswers] = useState(prop.question.answers);

    const [modifyPopup, setModifyPopup] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false);


    const closePopup = () => {
        setModifyPopup(false);
        setDeletePopup(false);
    }

    const handleChangeContent = (index, e) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index].answerContent = e.target.value;
        setAnswers(updatedAnswers);
        setQuestion({ ...question, answers: updatedAnswers })
    }

    const handleChangeCorrect = (index) => {
        const updatedAnswers = answers.map((answer, idx) => ({
            ...answer,
            isCorrect: idx === index
        }));
        setAnswers(updatedAnswers);
        setQuestion({ ...question, answers: updatedAnswers })
    } 

    const handleModifyQuestion = async () => {
        const res = await axios.put(`http://localhost:8080/api/v1/question/${prop.question.id}`, question);
        alert(res.data.message);
        setModifyPopup(false);
    }

    const handleDeleteQuestion = async () => {
        const res = await axios.delete(`http://localhost:8080/api/v1/question/${prop.question.id}`)
        alert(res.data.message);
        setDeletePopup(false);
        window.location.reload();
    }

    return (
        <>
            <div className={cn("question-item-container")}>
                <div className={cn('head')}>
                    <p>Câu {question.questionCode.substr(2, 3)}</p>
                    <div className={cn('question-action')}>
                        <button
                            onClick={() => {setModifyPopup(true)}}
                        ><i className="fa-solid fa-pencil"></i>
                        Sửa</button>
                        <button
                            onClick={() => {setDeletePopup(true)}}
                        ><i className="fa-solid fa-trash-can"></i>
                        Xóa</button>
                    </div>
                </div>

                <div className={cn('question-content')}>
                    <p>{question.questionContent}</p>
                </div>

                <div className={cn('answers')}>
                    {
                        answers.map((answer, index) => (
                            <div key={index} className={cn('answer-content')}>
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

            {
                modifyPopup &&
                <Popup onClick={() => closePopup()}>
                    <div className={cn('question-form')}>
                        <div className={cn('question-form-header')}>
                            <div className={cn('question-type')}>
                                <p>{question.type.typeName}</p>
                                <p>Câu {question.questionCode.substr(2, 3)}</p>
                            </div>
                            <div className={cn('form-action')}>
                                <button 
                                    className={cn('btn-save')}
                                    onClick={() => {handleModifyQuestion()}}
                                >
                                    Lưu câu hỏi
                                </button>
                                <button className={cn('btn-close')}>
                                    <i className="fa-solid fa-xmark" onClick={() => closePopup()}></i>
                                </button>
                            </div>
                            
                        </div>

                        <textarea 
                            className={cn('question-content')} 
                            placeholder="Nhập nội dung câu hỏi"
                            defaultValue={question.questionContent}
                            onChange={(e) => {
                                setQuestion({ ...question, questionContent: e.target.value })
                            }}
                        />

                        <div className={cn('answers')}>
                            {
                                answers.map((answer, index) => (
                                    <div key={index} className={cn('answer')}>
                                        <input 
                                            type='radio' 
                                            className={cn('check-correct')} 
                                            checked={answer.isCorrect}
                                            onChange={() => {handleChangeCorrect(index)}}
                                        />
                                        <textarea 
                                            className={cn('answer-content')}
                                            value={answer.answerContent}
                                            onChange={(e) => {handleChangeContent(index, e)}}
                                        />
                                    </div>
                                ))
                            }
                        </div>

                        <textarea 
                            className={cn('explanation')}
                            placeholder='Thêm giải thích'
                            defaultValue={question.explanation}
                            onChange={(e) => {
                                setQuestion({ ...question, explanation: e.target.value })
                            }}
                        />

                    </div>
                </Popup>
            }

            {
                deletePopup &&
                <Popup onClick={() => closePopup()}>
                    <div className={cn('delete-question-form')}>
                        <div className={cn('form-header')}>
                            <h1 className={cn('title-delete-question')}>Bạn chắc chắn muốn xóa câu hỏi này?</h1>
                        </div>

                        <div className={cn('action-btn')}>
                            <button
                                className={cn('btn-cancel')}
                                onClick={() => closePopup()}
                            >Hủy
                            </button>
                            <button
                                className={cn('btn-delete')}
                                onClick={() => {handleDeleteQuestion()}}
                            >Xóa
                            </button>
                                
                        </div>
                    </div>
                </Popup>
            }
        </>
    );
};

export default QuestionItem;