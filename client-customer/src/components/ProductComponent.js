import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = { products: [] };
  }

  async componentDidMount() {
    const { cid, keyword } = this.props.params;
    if (cid) {
      const response = await axios.get(`/api/customer/products/category/${cid}`);
      this.setState({ products: response.data });
    } else if (keyword) {
      await this.apiGetProductsByKeyword(keyword);
    }
  }

  async componentDidUpdate(prevProps) {
    const { cid, keyword } = this.props.params;
    if (cid && cid !== prevProps.params.cid) {
      const response = await axios.get(`/api/customer/products/category/${cid}`);
      this.setState({ products: response.data });
    } else if (keyword && keyword !== prevProps.params.keyword) {
      await this.apiGetProductsByKeyword(keyword);
    }
  }

  async apiGetProductsByKeyword(keyword) {
    const response = await axios.get(
      `/api/customer/products/search/${encodeURIComponent(keyword)}`,
    );
    this.setState({ products: response.data });
  }

  render() {
    return (
      <div>
        <h2 className="text-center">LIST PRODUCTS</h2>
        <div className="align-center">
          {this.state.products.map((item) => (
            <figure className="inline text-center" key={item._id}>
              <Link to={'/product/' + item._id}>
                {item.image && (
                  <img
                    src={`data:image/jpg;base64,${item.image}`}
                    width="300px"
                    height="300px"
                    alt={item.name}
                  />
                )}
                <figcaption>{item.name}</figcaption>
                <figcaption>{item.price}</figcaption>
              </Link>
            </figure>
          ))}
        </div>
      </div>
    );
  }
}

export default withRouter(Product);
