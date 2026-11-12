import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = { product: null, txtQuantity: 1 };
  }

  async componentDidMount() {
    const { id } = this.props.params;
    const response = await axios.get('/api/customer/products/' + id);
    this.setState({ product: response.data });
  }

  async componentDidUpdate(prevProps) {
    const { id } = this.props.params;
    if (id !== prevProps.params.id) {
      const response = await axios.get('/api/customer/products/' + id);
      this.setState({ product: response.data });
    }
  }

  render() {
    const { product } = this.state;
    if (!product) return <div />;

    return (
      <div className="align-center">
        <figure className="text-center">
          {product.image && (
            <img
              src={`data:image/jpg;base64,${product.image}`}
              width="300px"
              height="300px"
              alt={product.name}
            />
          )}
          <figcaption>{product.name}</figcaption>
          <figcaption>{product.price}</figcaption>
          <figcaption>{product.category ? product.category.name : 'Uncategorized'}</figcaption>
        </figure>
        <div className="text-center">
          <form onSubmit={(e) => this.btnAdd2CartClick(e)}>
            <label>
              Quantity{' '}
              <input
                type="number"
                min="1"
                max="99"
                value={this.state.txtQuantity}
                onChange={(e) => this.setState({ txtQuantity: e.target.value })}
              />
            </label>
            <button type="submit">ADD TO CART</button>
          </form>
        </div>
      </div>
    );
  }

  btnAdd2CartClick(e) {
    e.preventDefault();

    const quantity = Number.parseInt(this.state.txtQuantity, 10);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      alert('Please input quantity between 1 and 99');
      return;
    }

    const mycart = this.context.mycart || [];
    const index = mycart.findIndex((item) => item.product._id === this.state.product._id);
    const updatedCart = [...mycart];

    if (index === -1) {
      updatedCart.push({ product: this.state.product, quantity: quantity });
    } else {
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: updatedCart[index].quantity + quantity
      };
    }

    this.context.setMycart(updatedCart);
    alert('Added to cart');
  }
}

export default withRouter(ProductDetail);
