import { useEffect, useState } from 'react';
import NavigationBar from '../components/NavigationBar';
import Popup from "../components/Popup.jsx";
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
	const [newStudent, setNewStudent] = useState({});
	const [selectedStudents, setSelectedStudents] = useState([]);

	const [popup, setPopup] = useState(false);
	const [message, setMessage] = useState('');

	const getStudents = async () => {
		const res = await axios.get("http://localhost:8080/api/v1/student");
		setStudents(res.data);
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

	const handleAddStudent = async () => {
		const res = await axios.post("http://localhost:8080/api/v1/student", newStudent);
		setMessage(res.data.message);
		closePopup();
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
            setMessage(res.data.message);
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
            setMessage(res.data.message);
        }
        catch (error){
            console.log(error);
        }
	}

	const closePopup = () => {
        setPopup(false);
    }

	useEffect(() => {
		getStudents();
		if(message !== ""){
			alert(message);
		}
	}, [message])

	return (
    <>
      <NavigationBar activeKey={routeName.student} />

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
              />
              <select
                name="sort-condition"
                className={cn("sort-box")}
                defaultValue=""
              >
                <option value="" disabled>
                  --Sắp xếp--
                </option>
                <option value="teacherCode">Mã sinh viên</option>
                <option value="teacherName">Tên sinh viên</option>
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
              <button className={cn("btn-add")} onClick={() => setPopup(true)}>
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

          {students.length === 0 ? (
            <div className={cn("no-student-notification")}>
              <p>Chưa có sinh viên trong hệ thống</p>
            </div>
          ) : (
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
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        name="select-student"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                      />
                    </td>
                    <td>{index + 1}</td>
                    <td>{student.studentCode}</td>
                    <td>{student.studentName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
                    studentName: e.target.value,
                  });
                }}
              />

              <button
                className={cn("btn-add-student")}
                onClick={() => handleAddStudent()}
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

export default Student;