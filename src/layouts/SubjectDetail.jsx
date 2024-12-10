import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import NavigationBar from "../components/NavigationBar";
import QuestionBankTable from "../components/QuestionBankTable";
import ExamQuestionBankTable from "../components/ExamQuestionBankTable";
import routeName from "../config/routename";
import classNames from "classnames/bind";
import styles from "../assets/css/SubjectDetail.module.scss";
import axios from "axios";

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

    const elementRef = useRef(null);
    const { subjectId } = useParams();
    const navigate = useNavigate();

    const [subject, setSubject] = useState({});

    const [activeComponent, setActiveComponent] = useState("QuestionBank");
    const [isVisible, setIsVisible] = useState(false);

    const getSubject = async () => {
        const res = await axios.get(`http://localhost:8080/api/v1/subject/${subjectId}`);
        setSubject(res.data);
    }

    const toggleVisibility = (e) => {
        e.stopPropagation();
        setIsVisible(!isVisible);
    };

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

    const handleDeleteSubject = async () => {
        const res = await axios.delete(`http://localhost:8080/api/v1/subject/${subjectId}`)
        alert(res.data.message);
        navigate(routeName.subject);
    }

    useEffect(() => {
        getSubject();
    }, []);

    return (
      <>
        <NavigationBar />

        <div className={cn("main-page")}>
          <div className={cn("header")}>
            <h1 className={cn("title")}>{subject.subjectName}</h1>
            <p>{subject.subjectCode}</p>

            <Navbar className={cn("class-navbar")}>
              <Container className={cn("navbar-container")}>
                <Navbar.Collapse className={cn("collapse")}>
                  <Nav className={cn("nav")}>
                    <Nav.Link
                      className={cn("nav-link", {
                        active: activeComponent === "QuestionBank",
                      })}
                      onClick={() => setActiveComponent("QuestionBank")}
                    >
                      Ngân hàng câu hỏi
                    </Nav.Link>
                    {role === "ROLE_TEACHER" && (
                      <Nav.Link
                        className={cn("nav-link", {
                          active: activeComponent === "ExamQuestionBank",
                        })}
                        onClick={() => setActiveComponent("ExamQuestionBank")}
                      >
                        Ngân hàng đề
                      </Nav.Link>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Container>

              {role === "ROLE_ADMIN" && (
                <div className={cn("setting")}>
                  <button onClick={(e) => toggleVisibility(e)}>
                    <i className="fa-solid fa-gear"></i>
                  </button>
                  {isVisible && (
                    <div ref={elementRef} className={cn("action-dropdown")}>
                      <p
                        className={cn("dropdown-item")}
                        onClick={(e) => {
                          toggleVisibility(e);
                        }}
                      >
                        Chỉnh sửa
                      </p>
                      <p
                        className={cn("dropdown-item")}
                        onClick={() => {
                          handleDeleteSubject();
                        }}
                      >
                        Xóa
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Navbar>
          </div>

          <div className={cn("content")}>
            {activeComponent === "QuestionBank" && (
              <div className={cn("question-bank")}>
                <QuestionBankTable subjectId={subjectId} />
              </div>
            )}

            {activeComponent === "ExamQuestionBank" && (
              <div className={cn("exam-question-bank")}>
                <ExamQuestionBankTable subjectId={subjectId} />
              </div>
            )}
          </div>
        </div>
      </>
    );
};

export default SubjectDetail;