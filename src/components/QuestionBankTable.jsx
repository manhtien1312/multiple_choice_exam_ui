import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/QuestionBankTable.module.scss';
import axios from 'axios';
import QuestionItem from './QuestionItem';
import Popup from './Popup';

const cn = classNames.bind(styles);

const QuestionBankTable = (prop) => {

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
    
    const [questionBankType, setQuestionBankType] = useState(1);
    const [questionBankId, setQuestionBankId] = useState('');
    const [questionBank, setQuestionBank] = useState([]);
    const [listQuestionType, setListQuestionType] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        type: {
            typeName: "",
        },
        questionCode: "",
        questionContent: "",
        level: "1",
        answers: [
            {
                answerContent: "",
                isCorrect: false
            },
            {
                answerContent: "",
                isCorrect: false
            },
            {
                answerContent: "",
                isCorrect: false
            },
            {
                answerContent: "",
                isCorrect: false
            },
        ],
        explanation: "",
    });

    const [image, setImage] = useState("");
    const [popup, setPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [focused, setFocused] = useState(false);

    const getQuestionBank = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/question-bank", {
                params: {
                    subjectId: prop.subjectId,
                    type: questionBankType,
                },
            });
            setQuestionBankId(res.data.id);
            setQuestionBank(res.data.questions)
        } catch (error) {
            console.log(error);
        }
    }

    const getQuestionType = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/question-type", {
            params: {
                subjectId: prop.subjectId
            }
        });
        setListQuestionType(res.data);
    }

    const handleExportQuestionBank = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/question-bank/export-excel", {
            params: {
                subjectId: prop.subjectId,
            },
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        const fileName = "ngan-hang-cau-hoi.xlsx";
        link.setAttribute('download', fileName);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
    }

    const handleUploadQuestionFile = async (e) => {
        const questionFile = e.target.files[0];
        if (!questionFile) {return null}

        const formData = new FormData();
        formData.append("subjectId", prop.subjectId);
        formData.append("questionFile", questionFile);

        try{
            const res = await axios.post("http://localhost:8080/api/v1/question/add-file",
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

    const openAddQuestionForm = () => {
        getQuestionType();
        setPopup(true);
    }

    const handleChangeContent = (index, e) => {
        const updatedAnswers = [...newQuestion.answers];
        updatedAnswers[index].answerContent = e.target.value;
        setNewQuestion({ ...newQuestion, answers: updatedAnswers })
    }

    const handleUploadQuestionImage = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload = () => {
            setImage(reader.result);
        }
    }

    const handleChangeCorrect = (index) => {
        const updatedAnswers = newQuestion.answers.map((answer, idx) => ({
            ...answer,
            isCorrect: idx === index
        }));
        setNewQuestion({ ...newQuestion, answers: updatedAnswers })
    }

    const handleAddQuestion = async () => {
        const imageFile = document.getElementById("imageInput").files[0];
        
        const formData = new FormData();
        formData.append("questionBankId", questionBankId);
        formData.append("questionStr", JSON.stringify(newQuestion));
        formData.append("questionImage", imageFile);
        const res = await axios.post("http://localhost:8080/api/v1/question",
            formData, 
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        )
        setMessage(res.data.message);
        closePopup();
    }

    const closePopup = () => {
        setPopup(false);
    }

    useEffect(() => {
        getQuestionBank();
        if(message !== ""){
            alert(message);
            setMessage("");
        }
    }, [message, questionBankType]);

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

                    <select
                        name='question-bank-type'
                        className={cn('select-question-bank')}
                        onChange={(e) => {
                            setQuestionBankType(e.target.value);
                        }}
                    >
                        <option value="1">Ngân hàng thi</option>
                        <option value="0">Ngân hàng ôn tập</option>            
                    </select>
                </div>

                <div>
                    <button
                        className={cn('btn-file')}
                        onClick={() => handleExportQuestionBank()}
                    >Export <i className="fa-regular fa-file-excel"></i>
                    </button>
                    <button
                        className={cn('btn-file')}
                        onClick={() => {
                            document.getElementById("fileInput").click()
                        }}
                    >Import <i className="fa-regular fa-file-excel"></i>
                    </button>
                    <button
                        className={cn('btn-add-question')}
                        onClick={() => openAddQuestionForm()}
                    >Thêm câu hỏi
                    </button>
                    <input
                        type="file" id="fileInput"
                        style={{display: 'none'}}
                        onChange={(e) => {handleUploadQuestionFile(e)}}/>
                </div>
            </div>  

            <div className={cn('question-list')}>
                <p className={cn('total')}>{questionBank.length} câu hỏi</p>
                {
                    questionBank.map((question) => (
                        <QuestionItem key={question.id} question={question} />
                    ))
                }
            </div>

            {
                popup &&
                <Popup onClick={() => closePopup()}>
                    <div className={cn('question-form')}>
                        <div className={cn('question-form-header')}>
                            <div className={cn('question-type')}>
                                <input
                                    className={cn('input-question-type')}
                                    type='text'
                                    placeholder="Loại câu hỏi"
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    value={newQuestion.type.typeName}
                                    onChange={(e) => {
                                        setNewQuestion({
                                          ...newQuestion,
                                          type: {
                                            typeName: e.target.value,
                                          },
                                        });
                                    }}
                                />
                                <input
                                    type='text'
                                    placeholder='Mã câu hỏi'
                                    value={newQuestion.questionCode}
                                    onChange={(e) => {
                                        setNewQuestion({ ...newQuestion,
                                            questionCode: e.target.value
                                         })
                                    }}
                                />
                                <select
                                    name='question-level'
                                    className={cn('select-question-level')}
                                    defaultValue=""
                                    onChange={(e) => {
                                        setNewQuestion({
                                          ...newQuestion,
                                          level: e.target.value,
                                        });
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
                                >Thêm hình ảnh</button>
                                <input
                                    type="file" id="imageInput"
                                    style={{display: 'none'}}
                                    onChange={(e) => {handleUploadQuestionImage(e)}}
                                    />
                                {
                                    focused &&
                                    <div className={cn('list-type')}>
                                        {
                                            listQuestionType.map((questionType) => (
                                                <div 
                                                    key={questionType.id}
                                                    onMouseDown={() => {
                                                        setNewQuestion({ ...newQuestion,
                                                            type: {
                                                                typeName: questionType.typeName
                                                            }
                                                         })
                                                    }}
                                                >
                                                    {questionType.typeName}
                                                </div>
                                            ))
                                        }
                                    </div>
                                }
                            </div>
                            <div className={cn('form-action')}>
                                <button 
                                    className={cn('btn-save')}
                                    onClick={() => {handleAddQuestion()}}
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
                                value={newQuestion.questionContent}
                                onChange={(e) => {
                                    setNewQuestion({ ...newQuestion,
                                        questionContent: e.target.value
                                     })
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
                                newQuestion.answers.map((answer, index) => (
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
                                            placeholder={`Đáp án ${index+1}`}
                                            onChange={(e) => {handleChangeContent(index, e)}}
                                        />
                                    </div>
                                ))
                            }
                        </div>

                        <textarea 
                            className={cn('explanation')}
                            placeholder='Thêm giải thích'
                            value={newQuestion.explanation}
                            onChange={(e) => {
                                setNewQuestion({ ...newQuestion,
                                    explanation: e.target.value
                                 })
                            }}
                        />

                    </div>
                </Popup>
            }                                              
        </>
    );
};

export default QuestionBankTable;