import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CartUtil from '../utils/CartUtil';
import withRouter from '../utils/withRouter';

class Mycart extends Component {
  static contextType = MyContext;

  render() {
    const mycart = (this.context.mycart || []).map((item, index) => (
      <tr key={item.product._id} className="datatable">
        <td>{index + 1}</td>
        <td>{item.product._id}</td>
        <td>{item.product.name}</td>
        <td>{item.product.category?.name || 'Uncategorized'}</td>
        <td>
          <img
            src={`data:image/jpg;base64,${item.product.image}`}
            width="70px"
            height="70px"
            alt={item.product.name}
          />
        </td>
        <td>{item.product.price}</td>
        <td>{item.quantity}</td>
        <td>{item.product.price * item.quantity}</td>
        <td>
          <span
            className="link"
            onClick={() => this.lnkRemoveClick(item.product._id)}
          >
            Remove
          </span>
        </td>
      </tr>
    ));

    return (
      <div className="align-center">
        <h2 className="text-center">ITEM LIST</h2>

        <table className="datatable" border="1">
          <tbody>
            <tr className="datatable">
              <th>No.</th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Image</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>

            {mycart}

            <tr>
              <td colSpan="6" />
              <td>Total</td>
              <td>{CartUtil.getTotal(this.context.mycart || [])}</td>
              <td>
                <span
                  className="link"
                  onClick={() => this.lnkCheckoutClick()}
                >
                  CHECKOUT
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  lnkRemoveClick(id) {
    const updatedCart = (this.context.mycart || []).filter(
      (item) => item.product._id !== id
    );
    this.context.setMycart(updatedCart);
  }

  lnkCheckoutClick() {
    if (!window.confirm('ARE YOU SURE ?')) return;

    const items = this.context.mycart || [];
    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!this.context.customer) {
      this.props.navigate('/login');
      return;
    }

    this.apiCheckout(items);
  }

  async apiCheckout(items) {
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    try {
      const response = await axios.post(
        '/api/customer/checkout',
        { items },
        config
      );
      const result = response.data;

      if (result.success) {
        alert(result.message || 'Order placed successfully');
        this.context.setMycart([]);
        this.props.navigate('/home');
      } else {
        alert(result.message || 'Checkout failed');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Checkout failed. Please try again.');
    }
  }
}

export default withRouter(Mycart);
