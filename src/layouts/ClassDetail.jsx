import {useEffect, useState, useRef} from "react";
import NavigationBar from "../components/NavigationBar.jsx";
import classNames from "classnames/bind";
import styles from "../assets/css/ClassDetail.module.scss";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import {Container, Nav, Navbar} from "react-bootstrap";
import ExpandableCard from "../components/ExpandableCard.jsx";
import Popup from "../components/Popup.jsx";
import routeName from "../config/routename.js";

const cn = classNames.bind(styles);

const ClassDetail = () => {

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
    const navigate = useNavigate();
    const { classId } = useParams();

    const [classDetail, setClassDetail] = useState({});
    const [teacher, setTeacher] = useState({});
    const [subject, setSubject] = useState({});
    const [students, setStudents] = useState([]);
    const [newStudent, setNewStudent] = useState({});
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [exams, setExams] = useState([]);
    
    const [activeComponent, setActiveComponent] = useState('Activity');
    const [popup, setPopup] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');

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

    const getClassDetail = async () => {
        const res = await axios.get(`http://localhost:8080/api/v1/class/${classId}`);
        setClassDetail(res.data);
        setTeacher(res.data.teacher);
        setSubject(res.data.subject);
        setStudents(res.data.students.sort((student1, student2) =>
          student1.studentFirstName.localeCompare(student2.studentFirstName)))
    }

    const getExams = async () => {
        if(role === "ROLE_TEACHER"){
          const res = await axios.get(
            "http://localhost:8080/api/v1/exam/teacher",
            {
              params: {
                classId: classId,
              },
            }
          );
          setExams(res.data);
        }

        if(role === "ROLE_STUDENT"){
          const res = await axios.get(
            "http://localhost:8080/api/v1/exam/student",
            {
              params: {
                classId: classId,
              },
            }
          );
          setExams(res.data);
        }
    }

    const handleAddStudentToClass = async () => {
        const params = {
            classId: classId,
        }
        const res = await axios.post("http://localhost:8080/api/v1/student/add-to-class",
            newStudent,
            {
                params: params,
            }
        );
        setMessage(res.data.message);
        setPopup(false);
    }

    const handleUploadStudentFile = async (e) => {
        const studentFile = e.target.files[0];
        if (!studentFile) {return null}

        const formData = new FormData();
        formData.append("classId", classId);
        formData.append("studentFile", studentFile);

        try{
            const res = await axios.post("http://localhost:8080/api/v1/student/add-student-file-to-class",
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

    const handleSelectAll = (e) => {
        if(e.target.checked){
            setSelectedStudents(students.map(student => student.id));
        }
        else {
            setSelectedStudents([]);
        }
    }

    const handleSelectStudent = (studentId) => {
        if(selectedStudents.includes(studentId)){
            setSelectedStudents(selectedStudents.filter(id => id !== studentId));
        }
        else {
            setSelectedStudents([...selectedStudents, studentId]);
        }
    }

    const isAllStudentSelected = selectedStudents.length === students.length;

    const handleRemoveStudents = async () => {
        try {
            const res = await axios.delete("http://localhost:8080/api/v1/student/remove-from-class", {
                data: selectedStudents,
                params: {
                    classId: classId,
                }
            });
            setSelectedStudents([]);
            setMessage(res.data.message);
        }
        catch (error){
            console.log(error);
        }
    }

    const handleDeleteClass = async () => {
        const res = await axios.delete(`http://localhost:8080/api/v1/class/${classId}`)
        alert(res.data.message);
        navigate(routeName.class);
    }

    const closePopup = () => {
        setPopup(false);
    }

    useEffect(() => {
        getClassDetail();
        getExams();
        if(message !== ''){
            alert(message);
        }
    }, [message]);

    return (
      <>
        <NavigationBar />

        <div className={cn("main-page")}>
          <div className={cn("header")}>
            <h1 className={cn("title")}>{classDetail.className}</h1>
            <p>{subject.subjectName}</p>

            <Navbar className={cn("class-navbar")}>
              <Container className={cn("navbar-container")}>
                <Navbar.Collapse className={cn("collapse")}>
                  <Nav className={cn("nav")}>
                    <Nav.Link
                      className={cn("nav-link", {
                        active: activeComponent === "Activity",
                      })}
                      onClick={() => setActiveComponent("Activity")}
                    >
                      Hoạt động
                    </Nav.Link>
                    <Nav.Link
                      className={cn("nav-link", {
                        active: activeComponent === "Information",
                      })}
                      onClick={() => setActiveComponent("Information")}
                    >
                      Danh sách sinh viên
                    </Nav.Link>
                    <Nav.Link
                      className={cn("nav-link", {
                        active: activeComponent === "Report",
                      })}
                      onClick={() => setActiveComponent("Report")}
                    >
                      Báo cáo điểm
                    </Nav.Link>
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
                          handleDeleteClass();
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
            {activeComponent === "Activity" && (
              <div className={cn("activity")}>
                {/*lấy danh sách bài ôn tập và kiểm tra từ server, truyền vào 2 list item của 2 card để hiển thị*/}
                <ExpandableCard cardTitle="Ôn tập" listItem={null} />
                <ExpandableCard 
                  cardTitle="Kiểm tra" 
                  classId={classId}
                  listItem={exams} 
                />
              </div>
            )}

            {activeComponent === "Information" && (
              <div className={cn("information")}>
                <div className={cn("action")}>
                  <div className={cn("filter")}>
                    <input
                      className={cn("search-box")}
                      name="search"
                      type="text"
                      placeholder="Tìm kiếm"
                      autoComplete="off"
                    />
                  </div>

                  {role === "ROLE_ADMIN" && (
                    <div>
                      {selectedStudents.length > 0 && (
                        <button
                          className={cn("btn-delete")}
                          onClick={() => {
                            handleRemoveStudents();
                          }}
                        >
                          Xóa đã chọn
                        </button>
                      )}
                      <button
                        className={cn("btn-add")}
                        onClick={() => setPopup(true)}
                      >
                        Thêm sinh viên
                      </button>
                      <input
                        type="file"
                        id="fileInput"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          handleUploadStudentFile(e);
                        }}
                      />
                    </div>
                  )}
                </div>

                {students.length === 0 ? (
                  <div className={cn("no-student-notification")}>
                    <p>Chưa có sinh viên trong lớp</p>
                  </div>
                ) : (
                  <div>
                    <table className={cn("student-table")}>
                      <thead>
                        <tr>
                          {role === "ROLE_ADMIN" && (
                            <th>
                              <input
                                type="checkbox"
                                name="select-all-student"
                                checked={isAllStudentSelected}
                                onChange={(e) => handleSelectAll(e)}
                              />
                            </th>
                          )}
                          <th>STT</th>
                          <th>Mã sinh viên</th>
                          <th>Họ và tên</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, index) => (
                          <tr key={index}>
                            {role === "ROLE_ADMIN" && (
                              <td>
                                <input
                                  type="checkbox"
                                  name="select-student"
                                  checked={selectedStudents.includes(
                                    student.id
                                  )}
                                  onChange={() =>
                                    handleSelectStudent(student.id)
                                  }
                                />
                              </td>
                            )}
                            <td>{index + 1}</td>
                            <td>{student.studentCode}</td>
                            <td>{student.studentFullName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeComponent === "Report" && <p>Báo cáo điểm</p>}
          </div>

          {popup && (
            <Popup onClick={() => closePopup()}>
              <div className={cn("add-student-form")}>
                <div className={cn("form-header")}>
                  <h1 className={cn("title-add-student")}>Thêm sinh viên</h1>
                  <i
                    className="fa-regular fa-circle-xmark"
                    onClick={() => closePopup()}
                  ></i>
                </div>

                <input
                  className={cn("input-student")}
                  name="student-code"
                  type="text"
                  placeholder="Mã sinh viên"
                  autoComplete="off"
                  onChange={(e) => {
                    setNewStudent({
                      ...newStudent,
                      studentCode: e.target.value,
                    });
                  }}
                />

                <input
                  className={cn("input-student")}
                  name="student-name"
                  type="text"
                  placeholder="Họ và tên"
                  autoComplete="off"
                  onChange={(e) => {
                    setNewStudent({
                      ...newStudent,
                      studentFullName: e.target.value,
                    });
                  }}
                />

                <button
                  className={cn("btn-add-student")}
                  onClick={() => handleAddStudentToClass()}
                >
                  Thêm
                </button>
              </div>
            </Popup>
          )}
        </div>
      </>
    );
};

export default ClassDetail;