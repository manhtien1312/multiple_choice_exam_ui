import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Notificattion from '../components/Notificattion.jsx';
import axios from "axios";
import classNames from "classnames/bind";
import styles from "../assets/css/CreateExamPage.module.scss";

const cn = classNames.bind(styles);

const CreateExamPage = () => {

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

    const { classId } = useParams();
    const elementRef = useRef(null);

    const [classDetail, setClassDetail] = useState({});
    const [subject, setSubject] = useState({});
    const [students, setStudents] = useState([]);
    const [searchStudents, setSearchStudents] = useState([]);
    const [allowedStudents, setAllowedStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState([]);
    const [examQuestion, setExamQuestion] = useState([]);
    const [selectedExamQuestion, setSelectedExamQuestion] = useState([]);
    const [newExam, setNewExam] = useState({
        examName: "",
        timeStart: null,
        timeEnd: null
    });

    const [validateInput, setValidateInput] = useState({
        examName: false,
        timeStart: false,
        validTimeStart: false,
        timeEnd: false,
        validTimeEnd: false,
        examQuestions: false
    });
    const [focused, setFocused] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [response, setResponse] = useState({
        status: "",
        message: ""
    });

    const getClassDetail = async () => {
        const res = await axios.get(`http://localhost:8080/api/v1/class/${classId}`);
        setClassDetail(res.data);
        setSubject(res.data.subject);
        setNewExam({ ...newExam, subject: res.data.subject, classBelonged: res.data });

        setStudents(res.data.students);
        setAllowedStudents(res.data.students);
        setSearchStudents(res.data.students);
    }

    const getListExamQuestion = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/exam-question", {
            params: {
                subjectId: subject.id
            }
        });
        setExamQuestion(res.data);
    }

    const handleChangeAllowedStudent = (e) => {
        const selecttion = e.target.value;
        switch (selecttion) {
            case "all":
                document.getElementById("input-student").style.display = "none";
                setAllowedStudents(students);
                setSelectedStudent([]);
                break;
            
            case "all-except":
                document.getElementById("input-student").style.display = "block";
                setAllowedStudents(students);
                setSelectedStudent([]);
                break;

            case "select":
                document.getElementById("input-student").style.display = "block";
                setAllowedStudents([]);
                setSelectedStudent([]);
                break;
        }
    }

    const handleSearchStudent = (e) => {
        const searchedStudent = students.filter((student) => 
            student.studentCode.toLowerCase().includes(e.target.value.toLowerCase()) ||
            student.studentFullName.toLowerCase().includes(e.target.value.toLowerCase())
        )
        setSearchStudents(searchedStudent);
    }

    const handleSelectStudent = (student) => {
        setSelectedStudent([ ...selectedStudent, student ]);
        const selectValue = document.getElementById("select-student").value;
        switch (selectValue) {
            case "all-except":
                setAllowedStudents(allowedStudents.filter((stu) => stu.id !== student.id));
                break;

            case "select":
                setAllowedStudents([ ...selectedStudent, student ]);
                break;
        }
    }

    const handleRemoveSelectedStudent = (index) => {
        const updatedSelectStudents = selectedStudent.filter((_, idx) => idx !== index);
        setSelectedStudent(updatedSelectStudents);
    } 

    const toggleVisibility = (e) => {
        e.stopPropagation();
        getListExamQuestion();
        setIsVisible(!isVisible);
    }

    const handleClickOutside = (e) => {
        if (elementRef.current && !elementRef.current.contains(e.target)) {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRemoveExamQuestion = (index) => {
        const updatedSelectedExamQuestions = selectedExamQuestion.filter((_, idx) => idx !== index);
        setSelectedExamQuestion(updatedSelectedExamQuestions);
    }

    const validate = () => {
        setValidateInput({
            examName: newExam.examName === "",
            timeStart: newExam.timeStart === null,
            validTimeStart: newExam.timeStart ? new Date(newExam.timeStart) <= new Date() ? true : false : false,
            timeEnd: newExam.timeEnd === null,
            validTimeEnd: newExam.timeEnd ? new Date(newExam.timeEnd) <= new Date(newExam.timeStart) ? true : false : false,
            examQuestions: selectedExamQuestion.length === 0
        });
  
        if (
            newExam.examName !== "" &&
            newExam.timeStart !== null,
            new Date(newExam.timeStart) > new Date() &&
            newExam.timeEnd !== null &&
            new Date(newExam.timeEnd) > new Date(newExam.timeStart) &&
            selectedExamQuestion.length !== 0
        ) {
          return true;
        } else {
          return false;
        }
    }

    const handleCreateExam = async () => {
        if(validate()){
            const requestBody = {
                exam: newExam,
                allowedStudents: allowedStudents,
                selectedExamQuestions: selectedExamQuestion
            }

            try {
                const res = await axios.post("http://localhost:8080/api/v1/exam", requestBody);
                setResponse({status: "success", message: res.data.message});
                setTimeout(() => {
                    setResponse({status: "", message: ""});
                    window.history.back();
                }, 3000);
            } catch (error) {
                setResponse({status: "failure", message: error.response.data.message});
                setTimeout(() => setResponse({ status: "", message: "" }), 3000);
            }
            
        }
    }

    useEffect(() => {
        getClassDetail();
    }, []);

    return (
        <>
            <NavigationBar />

            {response.message && <Notificattion response={response} />}

            <div className={cn('main-page')}>
                <div className={cn('header')}>
                    <h1 className={cn("title")}>{classDetail.className}</h1>
                    <p>{subject.subjectName}</p>
                </div>

                <div className={cn('content')}>
                    <div className={cn('action')}>
                        <p>Tạo bài thi</p>
                        <button onClick={() => {window.history.back()}}>Hủy tạo</button>
                    </div>

                    <div className={cn('exam-detail')}>
                        <div className={cn('exam-detail-grid')}>
                            <div className={cn('label')}>
                                <p>Tên bài thi</p>
                                <span>*</span>
                            </div>
                            <input
                                className={cn("input-exam-name")}
                                name="exam-name"
                                type="text"
                                autoComplete="off"
                                onChange={(e) => setNewExam({ ...newExam, examName: e.target.value })}
                            />
                            <div className={cn('validate-notification')}>
                                {
                                    validateInput.examName && 
                                    <p>Tên bài thi không được để trống</p>
                                }
                            </div>
                        </div>
                    </div>

                    <div className={cn('exam-detail')}>
                        <div className={cn('exam-detail-grid')}>
                            <div className={cn('label')}>
                                <p>Thời gian bắt đầu</p>
                                <span>*</span>
                            </div>
                            <input
                                type="datetime-local"
                                id="meeting-time"
                                name="meeting-time"
                                onChange={(e) => setNewExam({ ...newExam, timeStart: e.target.value })}
                            />
                            <div className={cn('validate-notification')}>
                                {validateInput.validTimeStart && <p>Thời gian bắt đầu không hợp lệ</p>}
                                {validateInput.timeStart && <p>Thời gian bắt đầu không được để trống</p>}
                            </div>
                        </div>
                        <div className={cn('exam-detail-grid')}>
                            <div className={cn('label')}>
                                <p>Thời gian kết thúc</p>
                                <span>*</span>
                            </div>
                            <input
                                type="datetime-local"
                                id="meeting-time"
                                name="meeting-time"
                                onChange={(e) => setNewExam({ ...newExam, timeEnd: e.target.value })}
                            />
                            <div className={cn('validate-notification')}>
                                {validateInput.validTimeEnd && <p>Thời gian kết thúc không hợp lệ</p>}
                                {validateInput.timeEnd && <p>Thời gian kết thúc không được để trống</p>}
                            </div>
                        </div>
                    </div>

                    <div className={cn('exam-detail')}>
                        <div className={cn('exam-detail-grid')}>
                            <div className={cn('label')}>
                                <p>Sinh viên tham gia</p>
                            </div>
                            <div className={cn('allowed-student')}>
                                <select
                                    id="select-student"
                                    onChange={(e) => handleChangeAllowedStudent(e)}
                                >
                                    <option value="all">Tất cả sinh viên trong lớp</option>
                                    <option value="all-except">Tất cả sinh viên trong lớp, ngoại trừ</option>
                                    <option value="select">Chọn sinh viên</option>
                                </select>
                                {
                                    selectedStudent.length !== 0 &&
                                    <ul>
                                        {
                                            selectedStudent.map((student, index) => (
                                                <li key={student.id}>
                                                    <p>{index+1}. {student.studentCode} - {student.studentFullName}</p>
                                                    <span
                                                        onMouseDown={() => handleRemoveSelectedStudent(index)}
                                                    ><i className="fa-solid fa-xmark"></i></span>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                }
                                <input
                                    id="input-student"
                                    name="student"
                                    type="text"
                                    placeholder="Tìm mã hoặc họ tên sinh viên"
                                    autoComplete="off"
                                    style={{display: 'none'}}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                    onChange={(e) => handleSearchStudent(e)}
                                />
                                {
                                    focused &&
                                    <div className={cn('list-student')}>
                                        {
                                            searchStudents
                                            .filter((student) => 
                                                !selectedStudent.some((selected) => selected.id === student.id)
                                            )
                                            .map((student) => (
                                                <div 
                                                    key={student.id}
                                                    onMouseDown={() => handleSelectStudent(student)}
                                                >
                                                    {student.studentCode} - {student.studentFullName}
                                                </div>
                                            ))
                                        }
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    <div className={cn('exam-detail')}>
                        <div className={cn('exam-detail-grid')}>
                            <div className={cn('label')}>
                                <p>Chọn đề thi</p>
                                <span>*</span>
                            </div>
                            {
                                !isVisible &&
                                    <div>
                                        <div className={cn('selected-exam-question')}>
                                            {
                                                selectedExamQuestion.length !== 0 && 
                                                selectedExamQuestion.map((examQuestion, index) => (
                                                    <div key={examQuestion.id}>
                                                        <p>Đề {examQuestion.examQuestionCode}</p>
                                                        <span
                                                            onMouseDown={() => handleRemoveExamQuestion(index)}
                                                        ><i className="fa-solid fa-xmark"></i></span>
                                                    </div>
                                                ))
                                            }
    
                                        </div>
                                        <button
                                            onClick={(e) => toggleVisibility(e)}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                            Thêm đề thi
                                        </button>
                                    </div>
                            }
                            {
                                isVisible &&
                                <div ref={elementRef} className={cn('search-exam-question')}>
                                    <input
                                        id="input-exam-question"
                                        name="exam-question"
                                        type="text"
                                        placeholder="Tìm mã đề thi"
                                        autoComplete="off"
                                    />

                                    <div className={cn('list-exam-question')}>
                                        {
                                            examQuestion
                                            .filter((examQuestion) => 
                                                !selectedExamQuestion.some((selected) => selected.id === examQuestion.id)
                                            )
                                            .map((examQuestion) => (
                                                <div 
                                                    key={examQuestion.id}
                                                    onMouseDown={() => {
                                                        setSelectedExamQuestion([ ...selectedExamQuestion, examQuestion ])
                                                        setIsVisible(false);
                                                    }}
                                                >
                                                    Đề {examQuestion.examQuestionCode}
                                                </div>
                                            ))
                                        }
                                    </div>

                                </div>
                            }

                        <div className={cn('validate-notification')}>
                                {validateInput.examQuestions && <p>Danh sách đề thi không được để trống</p>}
                            </div>
                        </div>
                    </div>

                    <button 
                        className={cn('create-exam-btn')}
                        onClick={() => handleCreateExam()}
                    >
                        Tạo bài thi
                    </button>

                </div>
            </div>
        </>
    );
};

export default CreateExamPage;