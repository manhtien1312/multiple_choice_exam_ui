import {useEffect, useState} from 'react';

import NavigationBar from '../components/NavigationBar.jsx';
import Notificattion from '../components/Notificattion.jsx';
import TeacherItem from "../components/TeacherItem.jsx";
import Popup from "../components/Popup.jsx";

import routeName from '../config/routename';
import classNames from "classnames/bind";
import styles from '../assets/css/Teacher.module.scss';
import axios from "axios";

const cn = classNames.bind(styles);

const Teacher = () => {

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

    const [popup, setPopup] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [newTeacher, setNewTeacher] = useState({ 
      teacherCode: "",
      teacherName: "",
      phoneNumber: "",
      email: "",
      major: {majorName: ""} 
    });
    const [majors, setMajors] = useState([]);

    const [focused, setFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [validateInput, setValidateInput] = useState({
      validTeacherCode: false,
      teacherCode: false,
      teacherName: false,
      phoneNum: false,
      email: false,
      major: false
    });
    const [response, setResponse] = useState({
      status: "",
      message: ""
    });


    const getTeachers = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/teacher");
        setTeachers(res.data);
    }

    const getMajors = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/major");
        setMajors(res.data);
    }

    const handleFilterTeacher = async (e) => {
        const res = await axios.get("http://localhost:8080/api/v1/teacher/filter", {
            params: {
                majorName: e.target.value
            }
        });
        setTeachers(res.data);
    }

    const validate = () => {
      setValidateInput({
        teacherCode: newTeacher.teacherCode === "",
        teacherName: newTeacher.teacherName === "",
        phoneNum: newTeacher.phoneNumber === "",
        email: newTeacher.email === "",
        major: newTeacher.major.majorName === ""
      });

      if(newTeacher.teacherCode !== "" && 
        newTeacher.teacherName !== "" &&
        newTeacher.phoneNumber !== "" &&
        newTeacher.email !== "" &&
        newTeacher.major.majorName !== "" 
      ) {
        return true;
      } 
      else {
        return false;
      }
    }

    const handleAddTeacher = async () => {
        try {
          if(validate()){
            const res = await axios.post("http://localhost:8080/api/v1/teacher", newTeacher);
            setResponse({status: "success", message: res.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
            setPopup(false);
            setNewTeacher({...newTeacher, major: { majorName: "" }});
          }
        } catch (error) {
          setValidateInput({ ...validateInput,
            validTeacherCode: true,
            teacherCode: newTeacher.teacherCode === "",
            teacherName: newTeacher.teacherName === "",
            phoneNum: newTeacher.phoneNumber === "",
            email: newTeacher.email === "",
            major: newTeacher.major.majorName === ""
          });
          setResponse({status: "failure", message: error.response.data.message});
          setTimeout(() => setResponse({status: "", message: ""}), 3000);
        }
    }

    const closePopup = () => {
        setPopup(false);
    }

    const handleUploadTeacherFile = async (e) => {
        const teacherFile = e.target.files[0];
        if (!teacherFile) {return null}

        const formData = new FormData();
        formData.append("teacherFile", teacherFile);

        try{
            const res = await axios.post("http://localhost:8080/api/v1/teacher/add-excel",
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' }
                }
            );
            setResponse({status: "success", message: res.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
            e.target.value = "";
        }
        catch (error){
          setResponse({status: "failure", message: error.response.data.message});
          setTimeout(() => setResponse({ status: "", message: "" }), 3000);
          e.target.value = "";
        }

    }

    useEffect(() => {
        getTeachers();
        getMajors();
    }, [response.message]);

    useEffect(() => {

        if(!searchText){
            getTeachers();
            return;
        }

        const delay = setTimeout(async () => {
            const res = await axios.get("http://localhost:8080/api/v1/teacher/search", {
                params: {
                    searchText: searchText
                }
            });
            setTeachers(res.data);
        }, 1500);

        return () => clearTimeout(delay);
    }, [searchText]);

    return (
      <>
        <NavigationBar activeKey={routeName.teacher} />

        {response.message && <Notificattion response={response} />}

        <div className={cn("main-page")}>
          <div className={cn("container")}>
            <h1 className={cn("header")}>Danh sách giáo viên</h1>
            <div className={cn("action")}>
              <div className={cn("filter")}>
                <input
                  className={cn("search-box")}
                  name="search"
                  type="text"
                  placeholder="Tìm kiếm"
                  autoComplete="off"
                  onChange={(e) => setSearchText(e.target.value)}
                />

                <select
                  name="filter-major"
                  className={cn("sort-box")}
                  defaultValue=""
                  onChange={(e) => handleFilterTeacher(e)}
                >
                  <option value="">Lọc Khoa - Ngành</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.majorName}>
                      {major.majorName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  className={cn("btn-add")}
                  onClick={() => setPopup(true)}
                >
                  Thêm giáo viên
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
                    handleUploadTeacherFile(e);
                  }}
                />
              </div>
            </div>

            {teachers.length === 0 ? (
              <div className={cn("no-teacher-notification")}>
                <p>Không có giáo viên trong hệ thống</p>
              </div>
            ) : (
              <div className={cn("list")}>
                {teachers.map((teacher, index) => (
                  <TeacherItem
                    key={index}
                    teacher={teacher}
                    majors={majors}
                    reload={getTeachers}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {popup && (
          <Popup onClick={() => closePopup()}>
            <div className={cn("add-teacher-form")}>
              <div className={cn("form-header")}>
                <h1 className={cn("title-add-teacher")}>Thêm giáo viên</h1>
                <i
                  className="fa-regular fa-circle-xmark"
                  onClick={() => closePopup()}
                ></i>
              </div>

              <div className={cn("label")}>
                <div>
                  <label>Mã giáo viên</label>
                  <span>*</span>
                </div>
                {validateInput.validTeacherCode && (
                  <p className={cn("validate-input")}>
                    Mã giáo viên đã tồn tại
                  </p>
                )}
                {validateInput.teacherCode && (
                  <p className={cn("validate-input")}>
                    Mã giáo viên không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-teacher")}
                name="teacher-code"
                type="text"
                autoComplete="off"
                onChange={(e) => {
                  setNewTeacher({ ...newTeacher, teacherCode: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Họ và tên</label>
                  <span>*</span>
                </div>
                {validateInput.teacherName && (
                  <p className={cn("validate-input")}>
                    Họ tên giáo viên không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-teacher")}
                name="teacher-name"
                type="text"
                autoComplete="off"
                onChange={(e) => {
                  setNewTeacher({ ...newTeacher, teacherName: e.target.value });
                }}
              />

              <div className={cn("label")}>
                <div>
                  <label>Số điện thoại</label>
                  <span>*</span>
                </div>
                {validateInput.phoneNum && (
                  <p className={cn("validate-input")}>
                    Số điện thoại không được trống
                  </p>
                )}
              </div>
              <input
                className={cn("input-teacher")}
                name="teacher-phoneNumber"
                type="text"
                autoComplete="off"
                onChange={(e) => {
                  setNewTeacher({ ...newTeacher, phoneNumber: e.target.value });
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
                className={cn("input-teacher")}
                name="teacher-email"
                type="text"
                autoComplete="off"
                onChange={(e) => {
                  setNewTeacher({ ...newTeacher, email: e.target.value });
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
                  name="teacher-major"
                  type="text"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoComplete="off"
                  value={newTeacher.major.majorName}
                  onChange={(e) =>
                    setNewTeacher({
                      ...newTeacher,
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
                          setNewTeacher({ ...newTeacher, major: major })
                        }
                      >
                        {major.majorName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={cn("btn-add-teacher")}
                onClick={() => handleAddTeacher()}
              >
                Thêm
              </button>
            </div>
          </Popup>
        )}
      </>
    );
};

export default Teacher;