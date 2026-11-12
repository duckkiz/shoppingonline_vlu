import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class HomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = { newprods: [], hotprods: [] };
  }

  async componentDidMount() {
    const [newResponse, hotResponse] = await Promise.all([
      axios.get('/api/customer/products/new'),
      axios.get('/api/customer/products/hot'),
    ]);
    this.setState({
      newprods: newResponse.data,
      hotprods: hotResponse.data,
    });
  }

  renderProducts(products) {
    return products.map((item) => (
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
    ));
  }

  render() {
    return (
      <div>
        <h2 className="text-center">NEW PRODUCTS</h2>
        <div className="align-center">{this.renderProducts(this.state.newprods)}</div>
        {this.state.hotprods.length > 0 && (
          <>
            <h2 className="text-center">HOT PRODUCTS</h2>
            <div className="align-center">{this.renderProducts(this.state.hotprods)}</div>
          </>
        )}
      </div>
    );
  }
}

export default HomeComponent;
