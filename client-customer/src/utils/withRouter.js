import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function withRouter(Component) {
  return function WithRouter(props) {
    return <Component {...props} params={useParams()} navigate={useNavigate()} />;
  };
}

export default withRouter;
