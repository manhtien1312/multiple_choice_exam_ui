import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classNames from 'classnames/bind';
import styles from '../assets/css/ExpandableCard.module.scss';
import { motion } from 'framer-motion';

const cn = classNames.bind(styles);

const ExpandableCard = (prop) => {

    const role = localStorage.getItem("role");

    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [examStates, setExamStates] = useState([]);

    const animate = {
        layout: "position",
        animate: { opacity: 1 },
        transition: { delay: 0 },
        initial: { opacity: 0 },
    }

    const handleAddBtnClicked = () => {
        if(prop.cardTitle === "Kiểm tra"){
            navigate(`/class/${prop.classId}/new-exam`)
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const updatedStates = prop.listItem.map((exam) => {
                const startTime = new Date(exam.timeStart);
                const endTime = new Date(exam.timeEnd);

                if (now < startTime && (startTime - now) > 30 * 60 * 1000) {
                    // Trước thời gian bắt đầu hơn 30 phút
                    return { exam: exam, state: "start", data: formatDate(exam.timeStart) };
                } else if (now < startTime && (startTime - now) <= 30 * 60 * 1000) {
                    // Trong khoảng 30 phút trước khi bắt đầu
                    return { exam: exam, state: "countdown", data: calculateCountdown(exam.timeStart) };
                } else if (now >= startTime && now <= endTime) {
                    // Trong thời gian làm bài
                    return { exam: exam, state: "exam", data: null };
                } else {
                    // Sau thời gian kết thúc
                    return { exam: exam, state: "ended", data: "Kết thúc" };
                }
            });

            setExamStates(updatedStates);
        }, 1000);

        return () => clearInterval(timer); 
    }, [prop.listItem]);

    return (
        <motion.div
            className={cn('activity-item')}
            layout
        >
            <motion.div layout="position" className={cn('shrink')}>
                <button
                    className={cn('btn-expand')}
                    onClick={() => {
                        setIsExpanded(!isExpanded)
                    }}
                >
                    {
                        isExpanded ? <i className="fa-solid fa-angle-down"></i> :
                            <i className="fa-solid fa-angle-right"></i>
                    }
                </button>
                <p>{prop.cardTitle}</p>
            </motion.div>

            {
                isExpanded &&
                <>
                    <motion.div {...animate} className={cn('expand')}>

                        {   prop.listItem !== null && 
                            examStates.map((exam) => (
                                <div
                                    key={exam.id}
                                    className={cn('expand-item')}
                                >
                                    <p className={cn('item-name')}>{exam.exam.examName}</p>
                                    {
                                        exam.state === "start" && 
                                        <p className={cn('exam-state')}>{exam.data}</p>
                                    }
                                    {
                                        exam.state === "countdown" && 
                                        <p className={cn('exam-state')}>{exam.data}</p>
                                    }
                                    {
                                        exam.state === "exam" && 
                                        <button>
                                            { role === "ROLE_TEACHER" ? "Theo dõi" : "Vào thi" }
                                        </button>
                                    }
                                    {
                                        exam.state === "ended" && 
                                        <p className={cn('exam-state')}>{exam.data}</p>
                                    }
                                </div>     
                            ))
                        }
                        {
                            role !== "ROLE_ADMIN" &&
                            <button 
                                className={cn('btn-add')}
                                onClick={() => handleAddBtnClicked()}
                            >
                                <i className="fa-solid fa-plus"></i>
                                Thêm
                            </button>
                        }
                    </motion.div>
                </>
            }
        </motion.div>
    );
};

const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear(); 

    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0'); 

    return `${hours}:${minutes} ${day}/${month}/${year}`;
};

const calculateCountdown = (timeStart) => {
    const now = new Date();
    const startTime = new Date(timeStart);
    const diff = Math.floor((startTime - now) / 1000); // Số giây còn lại
    const minutes = String(Math.floor(diff / 60)).padStart(2, "0");
    const seconds = String(diff % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
};

export default ExpandableCard;