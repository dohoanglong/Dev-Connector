import React, { Fragment } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import Landing from './components/layout/Landing.jsx'
import Login from './components/auth/Login.jsx'
import Resgister from './components/auth/Resgister.jsx'

import './App.css';

function App() {
  return (
    <Router>
      <Fragment>
        <Navbar />
        <Route exact path='/' component={Landing} />
        <section className='container'>
          <Switch>
            <Route exact path='/register' component={Resgister} />
            <Route exact path='/login' component={Login} />            
          </Switch>
        </section>
      </Fragment>
    </Router>
  );
}

export default App;
