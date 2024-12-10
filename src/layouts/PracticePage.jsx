import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import PracticeHeader from "../components/PracticeHeader";
import QuestionCard from "../components/QuestionCard";
import { fetchPracticeQuestions } from "../utils/practiceApi";
import styles from "../assets/css/PracticePage.module.scss";

const PracticePage = ({ subjectId }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadQuestions = async () => {
      const data = await fetchPracticeQuestions(subjectId);
      setQuestions(data);
    };
    loadQuestions();
  }, [subjectId]);

  const handleNextQuestion = () => {
    setCurrentIndex((prev) => (prev + 1 < questions.length ? prev + 1 : 0));
  };

  return (
    <div className={styles.practicePage}>
      <PracticeHeader />
      {questions.length > 0 ? (
        <QuestionCard
          question={questions[currentIndex]}
          onNext={handleNextQuestion}
        />
      ) : (
        <p>Loading questions...</p>
      )}
    </div>
  );
};

// Thêm PropTypes cho subjectId
PracticePage.propTypes = {
  subjectId: PropTypes.string.isRequired,
};

export default PracticePage;
