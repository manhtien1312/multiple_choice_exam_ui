import axios from "axios";

const BASE_URL = "http://localhost:8080/api/practice";

export const fetchPracticeQuestions = async (subjectId) => {
  const response = await axios.get(`${BASE_URL}/subject/${subjectId}`);
  return response.data; // Mảng câu hỏi
};

export const checkAnswer = async (questionId, selectedAnswer) => {
  const response = await axios.post(`${BASE_URL}/question/${questionId}/check`, {
    selectedAnswer,
  });
  return response.data; // Boolean: đúng/sai
};

export const getExplanation = async (questionId) => {
  const response = await axios.get(`${BASE_URL}/question/${questionId}/explanation`);
  return response.data; // Chuỗi giải thích
};
