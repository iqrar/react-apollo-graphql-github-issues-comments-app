import React, { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { login } from './githubLogin'
import { username, password } from './config'
import Repository from './repository';
import Comments from './comments';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

let TOKEN = null

const networkInterface = createNetworkInterface('https://api.github.com/graphql')

networkInterface.use([
  {
    applyMiddleware (req, next) {
      if (!req.options.headers) {
        req.options.headers = {} 
      }
      req.options.headers.authorization = `Bearer ${TOKEN}`
      next()
    }
  }
])

const client = new ApolloClient({
  networkInterface
})

export default class App extends Component {
  constructor () {
    super()
    this.state = { login: false }
  }

  componentDidMount () {
    if (username === 'xxx') {
      throw new Error('Please create a config.js your username and password.')
    }

    if(localStorage.getItem('token')) {
        TOKEN =  localStorage.getItem('token')
        this.setState({ login: true })
    }else{

      login(username, password).then(token => {
      TOKEN = token
      localStorage.setItem('token', token)
      this.setState({ login: true })
     
     })
    }
  }

  routeForRepository (login, name) {
    return {
      title: `${login}/${name}`,
      component: Repository,
      login,
      name
    }
  }

  render () {
    if (!this.state.login) {
      return <p>Login...</p>
    }
    return this.state.login
      ? <BrowserRouter><ApolloProvider client={client}>
         <Switch>
          <Route exact path = "/home" render = {props => <Repository {...props}   /> }/>
         
          <Route  exact path = "/:id" render = {props => <Comments {...props}   /> } /> 
        </Switch>
      </ApolloProvider></BrowserRouter>
      : <p>Logging in...</p>
  }
}