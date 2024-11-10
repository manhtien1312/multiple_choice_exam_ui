import NavigationBar from "../components/NavigationBar";
import classNames from "classnames/bind";
import styles from "../assets/css/SubjectDetail.module.scss";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import QuestionBankTable from "../components/QuestionBankTable";

const cn = classNames.bind(styles);

const SubjectDetail = () => {

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

    const role = localStorage.getItem("role");
    const { subjectId } = useParams();

    const [subject, setSubject] = useState({});
    const [classes, setClasses] = useState([]);
    const [activeComponent, setActiveComponent] = useState(role === "ROLE_ADMIN" ? "Classes" : "QuestionBank");

    const getSubject = async () => {
        const res = await axios.get(`http://localhost:8080/api/v1/subject/${subjectId}`);
        setSubject(res.data);
    }

    const getClasses = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/class/subject-class", {
                params: {
                    subjectId: subjectId,
                }
            }
        );
        setClasses(res.data);
    }

    useEffect(() => {
        getSubject();
        getClasses();
    }, []);

    return (
        <>
            <NavigationBar />

            <div className={cn('main-page')}>

                <div className={cn('header')}>
                    <h1 className={cn('title')}>{subject.subjectName}</h1>
                    <p>{subject.subjectCode}</p>

                    <Navbar className={cn('class-navbar')}>
                        <Container className={cn('navbar-container')}>
                            <Navbar.Collapse className={cn('collapse')}>
                                <Nav className={cn('nav')}>
                                    {
                                        role === "ROLE_ADMIN" &&
                                        <Nav.Link
                                            className={cn('nav-link', {active: activeComponent === 'Classes'})}
                                            onClick={() => setActiveComponent('Classes')}
                                        >Lớp học</Nav.Link>
                                    }
                                    <Nav.Link
                                        className={cn('nav-link', {active: activeComponent === 'QuestionBank'})}
                                        onClick={() => setActiveComponent('QuestionBank')}
                                    >Ngân hàng câu hỏi</Nav.Link>
                                    <Nav.Link
                                        className={cn('nav-link', {active: activeComponent === 'ExamQuestionBank'})}
                                        onClick={() => setActiveComponent('ExamQuestionBank')}
                                    >Ngân hàng đề</Nav.Link>
                                    <Nav.Link
                                        className={cn('nav-link', {active: activeComponent === 'Setting'})}
                                        onClick={() => setActiveComponent('Setting')}
                                    >Tùy chọn</Nav.Link>
                                </Nav>
                            </Navbar.Collapse>
                        </Container>
                    </Navbar>
                </div>

                <div className={cn('content')}>

                    {
                        activeComponent === 'Classes' &&
                        <div className={cn('classes')}>
                            {
                                classes.map((classDto, index) => (
                                    <Link key={index} className={cn('list-item')}
                                                  to={`/class/${classDto.id}`}>
                                        <div className={cn('information')}>
                                            <p className={cn('class-name')}>{classDto.className}</p>
                                            <p className={cn('subject-name')}>Giáo viên: {classDto.teacherName}</p>
                                        </div>
                                    </Link>
                                ))
                            }
                        </div>
                    }

                    {
                        activeComponent === 'QuestionBank' &&
                        <div className={cn('question-bank')}>
                            <QuestionBankTable subjectId={subjectId} />
                        </div>
                    }

                    {
                        activeComponent === 'ExamQuestionBank' &&
                        <div className={cn('exam-question-bank')}>
                            ngan hang de
                        </div>
                    }

{
                        activeComponent === 'Setting' &&
                        <div className={cn('setting')}>
                            tuy chon mon hoc
                        </div>
                    }

                </div>
            </div>
        </>
    );
};

export default SubjectDetail;