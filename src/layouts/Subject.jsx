import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../components/NavigationBar';
import Notificattion from '../components/Notificattion.jsx';
import Popup from '../components/Popup';
import Select from 'react-select';
import routeName from '../config/routename';
import noSubjectImg from "../assets/images/no-classes.svg";
import classNames from "classnames/bind";
import styles from '../assets/css/Subject.module.scss';
import axios from 'axios';

const cn = classNames.bind(styles);

const Subject = () => {

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
    );

    const role = localStorage.getItem("role");

	const [subjects, setSubjects] = useState([]);
    const [majors, setMajors] = useState([]);
    const [options, setOptions] = useState([]);
    const [selectedMajor, setSelectedMajor] = useState([]);
	const [newSubject, setNewSubject] = useState({});
    
    const [searchText, setSearchText] = useState("");
	const [popup, setPopup] = useState(false);
	const [response, setResponse] = useState({
        status: "",
        message: ""
    });

	const getSubjects = async () => {
		const res = await axios.get("http://localhost:8080/api/v1/subject");
		setSubjects(res.data);
	}

    const getMajors = async () => {
        const res = await axios.get("http://localhost:8080/api/v1/major");
        setMajors(res.data);
        setOptions(res.data.map((major) => {
            return { value: major.majorName, label: major.majorName }
        }))
    }

	const closePopup = () => {
        setPopup(false);
    }

    const handleChangeSelect = (selected) => {
        setSelectedMajor(selected);
        setNewSubject({ ...newSubject, selectMajors: selected })
    }

    const handleFilterSubject = async (e) => {
        const res = await axios.get("http://localhost:8080/api/v1/subject/filter", {
            params: {
                majorName: e.target.value
            }
        });
        setSubjects(res.data);
    }

	const handleAddSubject = async () => {
		try {
			const res = await axios.post("http://localhost:8080/api/v1/subject", newSubject);
			setResponse({status: "success", message: res.data.message});
      setTimeout(() => setResponse({status: "", message: ""}), 3000);
			setPopup(false);
		} catch (error) {
			setResponse({status: "failure", message: error.response.data.message});
            setTimeout(() => setResponse({status: "", message: ""}), 3000);
		}
	}

	useEffect(() => {
		getSubjects();
        getMajors();
	}, [response.message]);

    useEffect(() => {

        if(!searchText){
            getSubjects();
            return;
        }

        const delay = setTimeout(async () => {
            const res = await axios.get("http://localhost:8080/api/v1/subject/search", {
                params: {
                    searchText: searchText,
                }
            });
            setSubjects(res.data);
        }, 1500);

        return () => clearTimeout(delay);
    }, [searchText]);

    return (
      <>
        <NavigationBar activeKey={routeName.subject} />

        {response.message && <Notificattion response={response} />}

        <div className={cn("main-page")}>
          <div className={cn("container")}>
            <h1 className={cn("header")}>Tất cả môn học</h1>

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
                  onChange={(e) => handleFilterSubject(e)}
                >
                  <option value="">Lọc Khoa - Ngành</option>
                  {majors.map((major) => (
                    <option key={major.id} value={major.majorName}>
                      {major.majorName}
                    </option>
                  ))}
                </select>
              </div>

              {role === "ROLE_ADMIN" && (
                <button
                  className={cn("btn-add-class")}
                  onClick={() => setPopup(true)}
                >
                  Thêm môn học
                </button>
              )}
            </div>

            {subjects.length === 0 ? (
              <div className={cn("no-subjects-notification")}>
                <img src={noSubjectImg} alt="no-subjects" />
                <p>Không có môn học nào trong hệ thống</p>
              </div>
            ) : (
              <div>
                <div className={cn("list")}>
                  {subjects.map((subject, index) => (
                    <Link
                      key={index}
                      className={cn("list-item")}
                      to={`/subject/${subject.id}`}
                    >
                      <div className={cn("information")}>
                        <p className={cn("class-name")}>
                          {subject.subjectName}
                        </p>
                        <p className={cn("subject-name")}>
                          {subject.subjectCode}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {popup && (
            <Popup onClick={() => closePopup()}>
              <div className={cn("add-subject-form")}>
                <div className={cn("form-header")}>
                  <h1 className={cn("title-add-subject")}>Thêm môn học</h1>
                  <i
                    className="fa-regular fa-circle-xmark"
                    onClick={() => closePopup()}
                  ></i>
                </div>

                <input
                  className={cn("input-subject")}
                  name="subject-name"
                  type="text"
                  placeholder="Mã môn học"
                  autoComplete="off"
                  onChange={(e) =>
                    setNewSubject({
                      ...newSubject,
                      subjectCode: e.target.value,
                    })
                  }
                />

                <input
                  className={cn("input-subject")}
                  name="subject-code"
                  type="text"
                  placeholder="Tên môn học"
                  autoComplete="off"
                  onChange={(e) =>
                    setNewSubject({
                      ...newSubject,
                      subjectName: e.target.value,
                    })
                  }
                />

                {/* <input
                                className={cn('input-subject')}
                                name='subject-major'
                                type='text'
                                placeholder='Chọn khoa/ngành'
                                autoComplete="off"
								// onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                            /> */}

                <Select
                  className={cn("select-major")}
                  placeholder="Chọn khoa/ngành"
                  options={options}
                  value={selectedMajor}
                  onChange={handleChangeSelect}
                  isMulti
                />

                <button
                  className={cn("btn-add-subject")}
                  onClick={() => handleAddSubject()}
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

export default Subject;