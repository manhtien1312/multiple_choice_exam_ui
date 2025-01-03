import { useState } from 'react';
import Popup from './Popup.jsx';
import Notificattion from '../components/Notificattion.jsx';
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
    const [image, setImage] = useState(prop.question.imageUrl ? prop.question.imageUrl : "");

    const [modifyPopup, setModifyPopup] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false);
    const [response, setResponse] = useState({
        status: "",
        message: ""
    });

    let questionLevel = "";
    switch (question.level) {
        case 1:
            questionLevel = "Dễ";
            break;
        case 2:
            questionLevel = "Trung bình";
            break;
        case 3: 
            questionLevel = "Khó";
            break;
    }

    const closePopup = () => {
        setModifyPopup(false);
        setDeletePopup(false);
    }

    const handleUploadQuestionImage = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            setImage(reader.result);
        }
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
        const imageFile = document.getElementById("imageInput").files[0];

        const formData = new FormData();
        formData.append("questionStr", JSON.stringify(question));
        formData.append("questionImage", imageFile);

        const res = await axios.put(`http://localhost:8080/api/v1/question/${prop.question.id}`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );
        setResponse({status: "success", message: res.data.message});
        setTimeout(() => {
            setResponse({status: "", message: ""});
            window.location.reload();
        }, 2000);
    }

    const handleDeleteQuestion = async () => {
        const res = await axios.delete(`http://localhost:8080/api/v1/question/${prop.question.id}`)
        setResponse({status: "success", message: res.data.message});
        setTimeout(() => {
            setResponse({status: "", message: ""});
            window.location.reload();
        }, 2000);
    }

    return (
        <>
            {response.message && <Notificattion response={response} />}

            <div className={cn("question-item-container")}>
                <div className={cn('head')}>
                    <div className={cn('question-information')}>
                        <p>Câu {question.questionCode.substr(2, question.questionCode.length-2)}</p>
                        <p>{question.type.typeName}</p>
                        <p>Độ khó: {questionLevel}</p>
                    </div>
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

                {
                    question.imageUrl &&
                    <div className={cn('question-image')}>
                        <img 
                            src={question.imageUrl}
                            alt='question-image'
                        />
                    </div>
                }

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
                                <p>Câu {question.questionCode.substr(2, question.questionCode.length-2)}</p>
                                <select
                                    name='question-level'
                                    className={cn('select-question-level')}
                                    defaultValue={question.level}
                                    onChange={(e) => {
                                        setQuestion({ ...question, level: e.target.value })
                                    }}
                                >
                                    <option value="" disabled>Độ khó</option>
                                    <option value="1">Dễ</option>
                                    <option value="2">Trung bình</option>
                                    <option value="3">Khó</option>            
                                </select>
                                <button
                                    onClick={() => {
                                        document.getElementById("imageInput").click()
                                    }}
                                >{image === "" ? "Thêm hình ảnh" : "Đổi hình ảnh"}</button>
                                <input
                                    type="file" id="imageInput"
                                    style={{display: 'none'}}
                                    onChange={(e) => {handleUploadQuestionImage(e)}}
                                />
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

                        <div className={cn('question')}>
                            <textarea 
                                className={cn('question-content')} 
                                placeholder="Nhập nội dung câu hỏi"
                                defaultValue={question.questionContent}
                                onChange={(e) => {
                                    setQuestion({ ...question, questionContent: e.target.value })
                                }}
                            />
                            <img 
                                className={cn('question-image')} 
                                src={image}
                                alt='question-image'
                                style={{display: image === "" ? 'none' : 'block'}}
                            />
                        </div>

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