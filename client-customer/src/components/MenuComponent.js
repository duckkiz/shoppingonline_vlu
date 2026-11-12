import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';

class Menu extends Component {
  constructor(props) {
    super(props);
    this.state = { categories: [], txtKeyword: '' };
  }

  async componentDidMount() {
    const response = await axios.get('/api/customer/categories');
    this.setState({ categories: response.data });
  }

  btnSearchClick(e) {
    e.preventDefault();
    this.props.navigate('/product/search/' + this.state.txtKeyword);
  }

  render() {
    return (
      <div className="border-bottom">
        <div className="float-left">
          <ul className="menu">
            <li className="menu"><Link to="/home">Home</Link></li>
            {this.state.categories.map((category) => (
              <li className="menu" key={category._id}>
                <Link to={`/product/category/${category._id}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="float-right">
          <form className="search" onSubmit={(e) => this.btnSearchClick(e)}>
            <input
              type="search"
              placeholder="Enter keyword"
              className="keyword"
              value={this.state.txtKeyword}
              onChange={(e) => this.setState({ txtKeyword: e.target.value })}
            />
            <input
              type="submit"
              value="SEARCH"
              onClick={(e) => this.btnSearchClick(e)}
            />
          </form>
        </div>
        <div className="float-clear" />
      </div>
    );
  }
}

export default withRouter(Menu);
