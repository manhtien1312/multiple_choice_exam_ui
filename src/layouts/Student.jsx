import { useEffect, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import Popup from "../components/Popup.jsx";
import Notificattion from '../components/Notificattion.jsx';
import routeName from '../config/routename';
import classNames from 'classnames/bind';
import styles from '../assets/css/Student.module.scss';
import axios from 'axios';

const cn = classNames.bind(styles);

const Student = () => {

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

	const [students, setStudents] = useState([]);
  const newStudent = { 
    studentCode: "",
    studentFullName: "",
    cohort: "",
    major: {majorName: ""} ,
    email: "",
  };
	const [student, setStudent] = useState(newStudent);
	const [selectedStudents, setSelectedStudents] = useState([]);
  const [majors, setMajors] = useState([]);
  const [cohorts, setCohorts] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [pagingResponse, setPagingResponse] = useState({
    first: true,
    last: false,
    totalElements: 3,
  })
  const [filterRequest, setFilterRequest] = useState({ majorName: "", cohort: "", searchText: "" });

  const [validateInput, setValidateInput] = useState({
    validStudentCode: false,
    studentCode: false,
    studentFullName: false,
    cohort: false,
    email: false,
    major: false
  });

  const [addStudent, setAddStudent] = useState(true);
  const [focused, setFocused] = useState(false);
	const [popup, setPopup] = useState(false);
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState({
    status: "",
    message: ""
  });

  const getMajorsAndCohorts = async () => {
    const majorRes = await axios.get("http://localhost:8080/api/v1/major");
    setMajors(majorRes.data);
    const cohortRes = await axios.get("http://localhost:8080/api/v1/student/cohort");
    setCohorts(cohortRes.data);
  }

  const handleSortStudent = (e) => {
    
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

  const validate = () => {
    setValidateInput({
      studentCode: student.studentCode === "",
      studentFullName: student.studentFullName === "",
      email: student.email === "",
      cohort: student.cohort === "",
      major: student.major.majorName === ""
    });

    if(student.studentCode !== "" && 
      student.studentFullName !== "" &&
      student.email !== "" &&
      student.cohort !== "" &&
      student.major.majorName !== "" 
    ) {
      return true;
    } 
    else {
      return false;
    }
  }

	const handleAddStudent = async () => {
    try {
      if(validate()){
        const res = await axios.post("http://localhost:8080/api/v1/student", student);
        setResponse({status: "success", message: res.data.message});
        setTimeout(() => setResponse({status: "", message: ""}), 3000);
        setPopup(false);
        setStudent(newStudent);
      }
    } catch (error) {
      setValidateInput({ ...validateInput,
        validStudentCode: true,
        studentCode: student.studentCode === "",
        studentFullName: student.studentFullName === "",
        email: student.email === "",
        cohort: student.cohort === "",
        major: student.major.majorName === ""
      });
      setResponse({status: "failure", message: error.response.data.message});
      setTimeout(() => setResponse({status: "", message: ""}), 3000);
    }
	}

  const handleSaveStudent = async () => {
    try {
      if(validate()){
        const res = await axios.put("http://localhost:8080/api/v1/student", student);
        setResponse({status: "success", message: res.data.message});
        setTimeout(() => setResponse({status: "", message: ""}), 3000);
        filterStudent();
        setPopup(false);
        setStudent(newStudent);
      }
    } catch (error) {
      setResponse({status: "failure", message: error.response.data.message});
      setTimeout(() => setResponse({status: "", message: ""}), 3000);
    }
  }

	const handleUploadStudentFile = async (e) => {
        const studentFile = e.target.files[0];
        if (!studentFile) {return null}

        const formData = new FormData();
        formData.append("studentFile", studentFile);

        try{
            const res = await axios.post("http://localhost:8080/api/v1/student/add-student-file",
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            setResponse({status: "success", message: res.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
        }
        catch (error){
            console.log(error);
        }
    }

	const handleDeleteStudents = async () => {
		try {
            const res = await axios.delete("http://localhost:8080/api/v1/student/delete-student", {
                data: selectedStudents,
            });
            setSelectedStudents([]);
            setResponse({status: "success", message: res.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
            filterStudent();
        }
        catch (error){
            console.log(error);
        }
	}

	const closePopup = () => {
        setPopup(false);
  }

  const filterStudent = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/v1/student/filter", {
        params: {
          searchText: filterRequest.searchText,
          majorName: filterRequest.majorName,
          cohort: filterRequest.cohort,
          pageNumber: currentPage
        }
      });
      setStudents(res.data.content);
      setPagingResponse({
        first: res.data.first,
        last: res.data.last,
        totalElements: res.data.totalElements
      });
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {  
    setLoading(true);
		getMajorsAndCohorts();

    const delay = setTimeout(() => {
      filterStudent();
    }, 1500);

    return () => clearTimeout(delay);
  }, [filterRequest, currentPage]);

	return (
    <>
      <NavigationBar activeKey={routeName.student} />

      {response.message && <Notificattion response={response} />}

      <div className={cn("main-page")}>
        <div className={cn("container")}>
          <h1 className={cn("header")}>Danh sách sinh viên</h1>
          <div className={cn("action")}>
            <div className={cn("filter")}>
              <input
                className={cn("search-box")}
                name="search"
                type="text"
                placeholder="Tìm kiếm"
                autoComplete="off"
                onChange={(e) => {
                  setFilterRequest({
                    ...filterRequest,
                    searchText: e.target.value,
                  });
                  setCurrentPage(0);
                }}
              />

              <select
                name="filter-major"
                className={cn("sort-box")}
                defaultValue=""
                onChange={(e) => {
                  setFilterRequest({
                    ...filterRequest,
                    majorName: e.target.value,
                  });
                  setCurrentPage(0);
                }}
              >
                <option value="">Lọc Khoa - Ngành</option>
                {majors.map((major) => (
                  <option key={major.id} value={major.majorName}>
                    {major.majorName}
                  </option>
                ))}
              </select>

              <select
                name="filter-major"
                className={cn("sort-box")}
                defaultValue=""
                onChange={(e) => {
                  setFilterRequest({
                    ...filterRequest,
                    cohort: e.target.value,
                  });
                  setCurrentPage(0);
                }}
              >
                <option value="">Lọc theo khóa</option>
                {cohorts.map((cohort, index) => (
                  <option key={index} value={cohort}>
                    Khóa {cohort}
                  </option>
                ))}
              </select>
            </div>

            <div>
              {selectedStudents.length > 0 && (
                <button
                  className={cn("btn-delete")}
                  onClick={() => {
                    handleDeleteStudents();
                  }}
                >
                  Xóa đã chọn
                </button>
              )}
              <button
                className={cn("btn-add")}
                onClick={() => {
                  setAddStudent(true)
                  setStudent(newStudent)
                  setPopup(true)
                  setEditable(true)
                }}
              >
                Thêm sinh viên
              </button>
              <button
                className={cn("btn-import-file")}
                onClick={() => {
                  document.getElementById("fileInput").click();
                }}
              >
                Import <i className="fa-regular fa-file-excel"></i>
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
          </div>

          {loading ? (
            <div className={cn("loader")}></div>
          ) : students.length === 0 ? (
            <div className={cn("no-student-notification")}>
              <p>Không có sinh viên trong hệ thống</p>
            </div>
          ) : (
            <div>
              <table className={cn("student-table")}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        name="select-all-student"
                        checked={isAllStudentSelected}
                        onChange={(e) => handleSelectAll(e)}
                      />
                    </th>
                    <th>STT</th>
                    <th>Mã sinh viên</th>
                    <th>Họ và tên</th>
                    <th>Khóa</th>
                    <th>Khoa/ngành</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr
                      key={index}
                      onMouseDown={() => {
                        setAddStudent(false)
                        setStudent(student)
                        setPopup(true)
                        setEditable(false)
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          name="select-student"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{student.studentCode}</td>
                      <td>{student.studentFullName}</td>
                      <td>{student.cohort}</td>
                      <td>{student.major.majorName}</td>
                      <td>{student.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={cn("pagination")}>
                <div className={cn("pagination-left")}>
                  <p>Tổng: {pagingResponse.totalElements}</p>
                </div>
                <div className={cn("pagination-right")}>
                  <p className={cn("current-page")}>
                    Trang hiện tại: {currentPage + 1}
                  </p>
                  <button
                    className={cn("icon-btn")}
                    disabled={pagingResponse.first}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <i className="fa-solid fa-angle-left"></i>
                  </button>
                  <button
                    className={cn("icon-btn")}
                    disabled={pagingResponse.last}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <i className="fa-solid fa-angle-right"></i>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {popup && (
          <Popup onClick={() => closePopup()}>
            <div className={cn("add-student-form")}>
              <div className={cn("form-header")}>
                <h1 className={cn("title-add-student")}>
                  {addStudent ? "Thêm sinh viên" : "Thông tin sinh viên"}
                </h1>
                <i
                  className="fa-regular fa-circle-xmark"
                  onClick={() => closePopup()}
                ></i>
              </div>

              <div className={cn("label")}>
                <div>
                  <label>Mã sinh viên</label>
                  <span>*</span>
                </div>
                {validateInput.validStudentCode && (
                  <p className={cn("validate-input")}>
                    Mã sinh viên đã tồn tại
                  </p>
                )}
                {validateInput.studentCode && (
                  <p className={cn("validate-input")}>
                    Mã sinh viên không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-student")}
                name="student-code"
                type="text"
                autoComplete="off"
                disabled={!editable}
                defaultValue={student.studentCode}
                onChange={(e) => {
                  if (e.target.value.length >= 3) {
                    const studentCode = e.target.value;
                    const cohort = "20" + studentCode.substring(1, 3);
                    setStudent({ ...student, cohort: cohort, studentCode: studentCode });
                  }
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Họ và tên</label>
                  <span>*</span>
                </div>
                {validateInput.studentFullName && (
                  <p className={cn("validate-input")}>
                    Họ tên sinh viên không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-student")}
                name="student-name"
                type="text"
                autoComplete="off"
                disabled={!editable}
                defaultValue={student.studentFullName}
                onChange={(e) => {
                  setStudent({ ...student, studentFullName: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Email</label>
                  <span>*</span>
                </div>
                {validateInput.email && (
                  <p className={cn("validate-input")}>Email không được trống</p>
                )}
              </div>
              <input
                className={cn("input-student")}
                name="student-email"
                type="text"
                autoComplete="off"
                disabled={!editable}
                defaultValue={student.email}
                onChange={(e) => {
                  setStudent({ ...student, email: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Khóa</label>
                  <span>*</span>
                </div>
                {validateInput.cohort && (
                  <p className={cn("validate-input")}>
                    Khóa sinh viên không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-student")}
                name="student-cohort"
                type="text"
                autoComplete="off"
                disabled={!editable}
                defaultValue={student.cohort}
                onChange={(e) => {
                  setStudent({ ...student, cohort: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Khoa/ngành</label>
                  <span>*</span>
                </div>
                {validateInput.major && (
                  <p className={cn("validate-input")}>
                    Khoa/ngành không được trống
                  </p>
                )}
              </div>
              <div className={cn("select-major")}>
                <input
                  name="student-major"
                  type="text"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoComplete="off"
                  disabled={!editable}
                  value={student.major.majorName}
                  onChange={(e) =>
                    setStudent({
                      ...student,
                      major: { majorName: e.target.value },
                    })
                  }
                />
                {focused && (
                  <div className={cn("list-major")}>
                    {majors.map((major) => (
                      <div
                        key={major.id}
                        onMouseDown={() =>
                          setStudent({ ...student, major: major })
                        }
                      >
                        {major.majorName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {
                addStudent ? (
                  <button
                    className={cn("btn-add-student")}
                    onClick={() => handleAddStudent()}
                  >
                    Thêm
                  </button>
                ) : (
                  <div className={cn("action-btn")}>
                    {editable ? (
                      <>
                        <button
                          className={cn("btn-action")}
                          onClick={() => handleSaveStudent()}
                        >
                          Lưu
                        </button>
                        <button
                          className={cn("btn-cancel")}
                          onClick={() => closePopup()}
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <button
                        className={cn("btn-action")}
                        onClick={() => setEditable(true)}
                      >
                        Sửa
                      </button>
                    )}
                  </div>
                )
              }
            </div>
          </Popup>
        )}
      </div>
    </>
  );
};

export default Student;