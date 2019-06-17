import React from 'react';
import { Link } from 'react-router-dom'
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const GetRepositoryInfoQuery = gql`
  query GetRepositoryIssues($states: [IssueState!],$name: String!,$login: String!) {
    repositoryOwner(login: $login) {
      repository(name: $name) {
        issues(last: 25, states: $states) {
          edges {
            node {
              id
              title
              bodyText  
            }
            cursor
          }
          pageInfo {
            hasPreviousPage
          }
        }
      }
    }
  }
`;

var withInfo;

withInfo = graphql(GetRepositoryInfoQuery, {
  options: ({ states = ['CLOSED', 'OPEN'],  login = "facebook" , name = "react" }) => {
    return {
      variables: {
        states,
        login,
        name
      }
    }
  },
  props: ({ data }) => {
    if (data.loading) {
      return { loading: true };
    }
    if (data.error) {
      console.error(data.error);
    }
    const { repository } = data;
    return { data };
  },
});

class Repository extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: []
    };
  }

  componentWillReceiveProps(newProps) {
    var repoIssues = [];
     if(JSON.parse(localStorage.getItem('repoIssues'))) {
         repoIssues = JSON.parse(localStorage.getItem('repoIssues'));  
     }else{
        repoIssues = newProps.data.repositoryOwner.repository.issues.edges;
        localStorage.setItem('repoIssues', JSON.stringify(repoIssues)) 
     }
     this.setState({
            issues: repoIssues
     });
    console.log(repoIssues);
  }

  handleChange (e) {
      var arry = []
      var filter = this.state.issues.filter(item => {
            return item.node.title.toLowerCase().search(e.target.value.toLowerCase()) !== -1;
      });
      this.setState({
            issues: filter
     });
      if(e.target.value === "") {
        this.props.history.push("/home")
      }
  }

  render() {
    return (
     <div className = 'container'>
       <h2 className = "heading-text"> React Repo Issues </h2>
       <input onChange = {this.handleChange.bind(this)} className = "search-text" type = "text"/>
       {this.state.issues.map(({ node }) => (
          <div key={node.id}>
          <ul className = "item">
           <a className="link" href = {`/${node.id}`}  >
            <h4 className = "heading-text"><span>{node.title}</span></h4>
            <p className = "paragraph-text">{node.bodyText}</p>
            </a>
          </ul>
          </div>
        ))}
      </div>
    )
  }
}

const RepositoryWithInfo = withInfo(Repository);
export default RepositoryWithInfo;
