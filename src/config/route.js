import routeName from "./routename";
import LoginPage from "../layouts/LoginPage";
import HomePage from "../layouts/HomePage";
import Class from "../layouts/Class";
import Teacher from "../layouts/Teacher";
import Student from "../layouts/Student";
import Subject from "../layouts/Subject";

const routes = [
  { path: routeName.login, component: LoginPage },
  { path: routeName.home, component: HomePage },
  { path: routeName.class, component: Class },
  { path: routeName.teacher, component: Teacher },
  { path: routeName.student, component: Student },
  { path: routeName.subject, component: Subject },
]

export { routes }