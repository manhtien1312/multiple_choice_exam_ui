import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from '../assets/css/QuestionBankTable.module.scss';
import axios from 'axios';
import QuestionItem from './QuestionItem';

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
    const [questionBank, setQuestionBank] = useState([]);
    const [message, setMessage] = useState("");

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

    useEffect(() => {
        const getQuestionBank = async () => {
            try {
                const res = await axios.get("http://localhost:8080/api/v1/question-bank", {
                    params: {
                        subjectId: prop.subjectId,
                        type: questionBankType,
                    },
                });
                setQuestionBank(res.data.questions)
            } catch (error) {
                console.log(error);
            }
        }

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
        </>
    );
};

export default QuestionBankTable;