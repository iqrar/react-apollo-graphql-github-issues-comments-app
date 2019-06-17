import React from 'react';
import { Link } from 'react-router-dom'
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const GetRepositoryInfoQuery = gql`
   query GetRepositoryIssues($id: ID!) {
    node(id: $id) {
      ... on Issue {
        comments(first: 10) {
          edges {
            node {
              id
              body
              author {
                login
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
  }
`;

const withInfo = graphql(GetRepositoryInfoQuery, {
  options: (props) => {
    return {
      variables: {
        id: props.match.params.id
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
    console.log(data)
    return { data };
  },
});

class Comments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: []
    };
  }

  componentWillReceiveProps(newProps) {
    var repoComments = [];
    if(JSON.parse(localStorage.getItem('repoComments'))  && JSON.parse(localStorage.getItem('params')) === this.props.match.params.id ) {
         repoComments = JSON.parse(localStorage.getItem('repoComments')); 
     }else{

        if(navigator.onLine){
            repoComments = newProps.data.node.comments.edges;
            localStorage.setItem('repoComments', JSON.stringify(repoComments))
            localStorage.setItem('params',  JSON.stringify(this.props.match.params.id))  
        } 
     }
     this.setState({
            comments: repoComments
     });  
  }

  render() {
    return  this.state.comments.length > 0 ? 
     <div className = 'container'>
       <h2 className = "heading-text"> React Repo Issue Comments </h2>
       {this.state.comments.map(({ node }) => (
          <div key={node.id}>
          <ul className = "item">
           <h4 className = "heading-text"><span> Author:{node.author.login}</span></h4>
           <p className = "paragraph-text">{node.body}</p>
          </ul>
          </div>
        ))}
      </div> 
      : 
      <div className = 'container'>
       <h2 className = "heading-text"> React Repo Issue Comments </h2>
       <h3 className = "heading-text"> Not available </h3>
      </div>  
  }
}

const CommentsWithInfo = withInfo(Comments);
export default CommentsWithInfo;

