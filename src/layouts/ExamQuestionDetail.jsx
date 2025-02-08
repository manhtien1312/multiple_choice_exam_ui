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

    const [subject, setSubject] = useState({});
    const [questionBankId, setQuestionBankId] = useState("");
    const [questionBank, setQuestionBank] = useState([]);
    const [fullQuestionBank, setFullQuestionBank] = useState([]);
    const [examQuestion, setExamQuestion] = useState({});
    const [listQuestion, setListQuestion] = useState([]);
    const [listQuestionType, setListQuestionType] = useState([]);
    const [filterRequest, setFilterRequest] = useState({ type: "", level: 0, searchText: "" });
    const [changeQuestionRequest, setChangeQuestionRequest] = useState({});
    
    const [change, setChange] = useState(false);
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
        setFullQuestionBank(res.data.questions);
        setQuestionBankId(res.data.id);
    }

    const getQuestionType = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/question-type", {
            params: {
                subjectId: subject.id
            }
        });
        setListQuestionType(res.data);
    }

    const handleFilterQuestion = async (e) => {
        const { name, value } = e.target;

        if(name === "question-type"){
            setFilterRequest({ ...filterRequest, type: value });
            const res = await axios.get("http://localhost:8080/api/v1/question/filter", {
                params: {
                    questionBankId: questionBankId,
                    typeName: value,
                    level: filterRequest.level,
                    searchText: filterRequest.searchText
                }
            });
            setQuestionBank(res.data);
        }
        else {
            setFilterRequest({ ...filterRequest, level: parseInt(value, 10) });
            const res = await axios.get("http://localhost:8080/api/v1/question/filter", {
                params: {
                    questionBankId: questionBankId,
                    typeName: filterRequest.type,
                    level: parseInt(value, 10),
                    searchText: filterRequest.searchText
                }
            });
            setQuestionBank(res.data);
        }
    }

    const handleChangeQuestion = async () => {
        const res = await axios.put("http://localhost:8080/api/v1/exam-question/change-question", changeQuestionRequest);
        alert(res.data.message);
        window.location.reload();
    }

    useEffect(() => {
        getExamQuestion();
    }, []);

    useEffect(() => {

        if(!filterRequest.searchText){
            setQuestionBank(fullQuestionBank);
            return;
        }

        const delay = setTimeout(async () => {
            const res = await axios.get("http://localhost:8080/api/v1/question/filter", {
                params: {
                    questionBankId: questionBankId,
                    typeName: filterRequest.type,
                    level: filterRequest.level,
                    searchText: filterRequest.searchText
                }
            });
            setQuestionBank(res.data);
          }, 1500);

        return () => clearTimeout(delay);
    }, [filterRequest.searchText]);

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
                                                <div className={cn('question-information')}>
                                                    <p>Câu {question.questionCode.substr(2, question.questionCode.length-2)}</p>
                                                    <p>{question.type.typeName}</p>
                                                    <p>Độ khó: {
                                                            question.level === 1 ? "Dễ" :
                                                            question.level === 2 ? "Trung bình" : "Khó"
                                                        }</p>
                                                </div>
                                                <div className={cn('question-action')}>
                                                    <button
                                                        onClick={() => {
                                                            setChangeQuestionRequest({ ...changeQuestionRequest, oldQuestion: question })
                                                            getQuestionBank();
                                                            getQuestionType();
                                                            setChange(true)
                                                        }}
                                                    ><i className="fa-solid fa-rotate"></i>
                                                    Đổi câu hỏi</button>
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
                                                    question.answers.map((answer, index) => (
                                                        <div key={answer.id} className={cn('answer-content')}>
                                                            <p>{index+1}. {answer.answerContent}</p>
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
                            <p className={cn('code')}>Bạn muốn đổi câu hỏi {changeQuestionRequest.oldQuestion.questionCode.substr(2, changeQuestionRequest.oldQuestion.questionCode.length-2)} thành:</p>
                            <button onClick={() => {setChange(false)}}>Hủy</button>
                        </div>

                        <div className={cn('filter')}>
                            <input
                                className={cn('search-box')}
                                name='search'
                                type='text'
                                placeholder='Tìm kiếm'
                                autoComplete="off"
                                onChange={(e) => setFilterRequest({ ...filterRequest, searchText: e.target.value })}
                            />

                            <select
                                name='question-type'
                                className={cn('select-question-type')}
                                defaultValue=""
                                onChange={(e) => handleFilterQuestion(e)}
                            >
                                <option value="">--Loại câu hỏi--</option>
                                {
                                    listQuestionType.map((type) => (
                                        <option 
                                            key={type.id}
                                            value={type.typeName}
                                        >{type.typeName}</option>
                                    ))
                                }          
                            </select>     

                            <select
                                name='question-level'
                                className={cn('select-question-level')}
                                defaultValue=""
                                onChange={(e) => handleFilterQuestion(e)}
                            >
                                <option value="0">--Độ khó--</option>
                                <option value="1">Dễ</option>
                                <option value="2">Trung bình</option>
                                <option value="3">Khó</option>            
                            </select>          
                        </div>

                        <div className={cn('list-question')}>
                            {
                                questionBank.map((question) => ( (!listQuestion.some(examQuestion => examQuestion.id === question.id)) &&
                                        <div key={question.id} className={cn("question-item-container")}>
                                            <div className={cn('head')}>
                                                <div className={cn('question-information')}>
                                                    <p>Câu {question.questionCode.substr(2, question.questionCode.length-2)}</p>
                                                    <p>{question.type.typeName}</p>
                                                    <p>Độ khó: {
                                                            question.level === 1 ? "Dễ" :
                                                            question.level === 2 ? "Trung bình" : "Khó"
                                                        }</p>
                                                </div>
                                                <div className={cn('question-action')}>
                                                    <button
                                                        onClick={() => {
                                                            setChangeQuestionRequest({ ...changeQuestionRequest,
                                                                newQuestion: question
                                                             })
                                                            setPopup(true);
                                                        }}
                                                    ><i className="fa-solid fa-rotate"></i>
                                                    Thay thế</button>
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
                                                    question.answers.map((answer, index) => (
                                                        <div key={answer.id} className={cn('answer-content')}>
                                                            <p>{index+1}. {answer.answerContent}</p>
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