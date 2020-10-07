export const UnauthenticatedRoutes = [
  {
    exact: true,
    path: "/login",
    component: "login",
  },
  {
    exact: true,
    path: "/register",
    component: "register",
  },
];

export const AuthenticatedRoutes = [
  {
    exact: true,
    path: "/home",
    component: "home",
  },
  {
    exact: true,
    path: "/message/:id",
    component: "home",
  },
  {
    exact: true,
    path: "/calling",
    component: "calling",
  }
];
