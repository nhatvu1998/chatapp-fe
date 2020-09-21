import React, {Suspense, lazy, useState, useEffect} from "react";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import { ApolloProvider } from '@apollo/client';
import { AuthenticatedRoutes, UnauthenticatedRoutes } from "./configs/router";
import PublicRoute from './components/PublicRoute'
import PrivateRoute from "./components/PrivateRoute";
import Loading from './components/Loading'
import {useSelector} from 'react-redux';
import 'antd/dist/antd.css';
import './App.scss'
import { createBrowserHistory } from "history";
import {Client} from "./tools/apollo";
import {Button, Result} from "antd";
import {Link} from "react-router-dom";
const history = createBrowserHistory()

const Components = {};
for (const c of AuthenticatedRoutes) {
  Components[c.component] = lazy(() => import(`./pages/` + c.component));
}

for (const c of UnauthenticatedRoutes) {
  Components[c.component] = lazy(() => import("./pages/" + c.component));
}
const token = window.localStorage.getItem("token");
function App() {
  const isAuthenticated = useSelector(state => state.auth.isSignedIn)

  return (
    <ApolloProvider client={Client}>
      <Router history={history}>
        <Switch>
          {UnauthenticatedRoutes.map((c) => {
            const C = Components[c.component];
            return (
                <Route
                    key={c.path}
                    exact={c.exact}
                    path={c.path}
                    render={(props) => (
                        <PublicRoute isAuthenticated={isAuthenticated}>
                          <Suspense fallback={<Loading />}>
                            <C {...props} isAuthenticated={isAuthenticated} />
                          </Suspense>
                        </PublicRoute>
                    )}
                />
            );
          })}
          {AuthenticatedRoutes.map((c) => {
            const C = Components[c.component];
            return (
                <Route
                    key={c.path}
                    exact
                    path={c.path}
                    render={(props) => (
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                          <Suspense fallback={<Loading />}>
                            <C {...props} isAuthenticated={isAuthenticated} />
                          </Suspense>
                        </PrivateRoute>
                    )}
                />
            );
          })}
          <Route render={() => (
            <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
            extra={<Link to='/home'><Button type="primary">Back Home</Button></Link>}
          />
          )} />
        </Switch>
      </Router>
    </ApolloProvider>
  );
}

export default App;
