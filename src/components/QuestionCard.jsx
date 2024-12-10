import { useState } from "react";
import PropTypes from "prop-types";  // Import PropTypes
import { checkAnswer, getExplanation } from "../utils/practiceApi";
import styles from "../assets/css/QuestionCard.module.scss";

const QuestionCard = ({ question, onNext }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [explanation, setExplanation] = useState("");

    const handleSubmit = async () => {
        const correct = await checkAnswer(question.id, selectedOption);
        setIsCorrect(correct);

        if (!correct) {
            const explanationText = await getExplanation(question.id);
            setExplanation(explanationText);
        }
    };

    return (
        <div className={styles.card}>
            <h2>{question.questionContent}</h2>
            <div className={styles.options}>
                {question.answers.map((option, index) => (
                    <button
                        key={index}
                        className={`${styles.option} ${isCorrect === true && option.isCorrect
                                ? styles.correct
                                : isCorrect === false && selectedOption === option.id
                                    ? styles.incorrect
                                    : ""
                            }`}
                        onClick={() => setSelectedOption(option.id)}
                        disabled={isCorrect !== null}
                    >
                        {option.answerContent}
                    </button>
                ))}
            </div>
            {isCorrect === null ? (
                <button className={styles.submit} onClick={handleSubmit} disabled={!selectedOption}>
                    Submit
                </button>
            ) : (
                <div>
                    {isCorrect ? (
                        <p className={styles.feedbackCorrect}>Correct!</p>
                    ) : (
                        <>
                            <p className={styles.feedbackIncorrect}>Incorrect!</p>
                            <p className={styles.explanation}>Explanation: {explanation}</p>
                        </>
                    )}
                    <button className={styles.next} onClick={onNext}>
                        Next Question
                    </button>
                </div>
            )}
        </div>
    );
};

// Thêm PropTypes để khai báo kiểu dữ liệu cho props
QuestionCard.propTypes = {
    question: PropTypes.shape({
        id: PropTypes.string.isRequired,
        questionContent: PropTypes.string.isRequired,
        answers: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.string.isRequired,
                answerContent: PropTypes.string.isRequired,
                isCorrect: PropTypes.bool.isRequired,
            })
        ).isRequired,
    }).isRequired,
    onNext: PropTypes.func.isRequired,
};

export default QuestionCard;
