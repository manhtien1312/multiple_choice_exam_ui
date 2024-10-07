import routeName from "./routename";
import LoginPage from "../layouts/LoginPage";
import HomePage from "../layouts/HomePage";

const routes = [
  { path: routeName.login, component: LoginPage },
  { path: routeName.home, component: HomePage },
]

export { routes }