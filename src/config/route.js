import routeName from "./routename";
import LoginPage from "../layouts/LoginPage";
import HomePage from "../layouts/HomePage";
import Class from "../layouts/Class";
import ClassDetail from "../layouts/ClassDetail";
import Teacher from "../layouts/Teacher";
import Student from "../layouts/Student";
import Subject from "../layouts/Subject";
import SubjectDetail from "../layouts/SubjectDetail";
import ExamQuestionDetail from "../layouts/ExamQuestionDetail";

const routes = [
  { path: routeName.login, component: LoginPage },
  { path: routeName.home, component: HomePage },
  { path: routeName.class, component: Class },
  { path: routeName.classDetail, component: ClassDetail },
  { path: routeName.teacher, component: Teacher },
  { path: routeName.student, component: Student },
  { path: routeName.subject, component: Subject },
  { path: routeName.subjectDetail, component: SubjectDetail },
  { path: routeName.examQuestionDetail, component: ExamQuestionDetail },
]

export { routes }