import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
  }

  render() {
    const customers = this.state.customers.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trCustomerClick(item)}
      >
        <td>{item._id}</td>
        <td>{item.username}</td>
        <td>{item.name}</td>
        <td>{item.phone}</td>
        <td>{item.email}</td>
        <td>{item.active}</td>
        <td>
          {item.active === 0 ? (
            <span
              className="link"
              onClick={(event) => {
                event.stopPropagation();
                this.lnkEmailClick(item);
              }}
            >
              EMAIL
            </span>
          ) : (
            <span
              className="link"
              onClick={(event) => {
                event.stopPropagation();
                this.lnkDeactiveClick(item);
              }}
            >
              DEACTIVE
            </span>
          )}
        </td>
      </tr>
    ));

    const orders = this.state.orders.map((item) => (
      <tr
        key={item._id}
        className="datatable"
        onClick={() => this.trOrderClick(item)}
      >
        <td>{item._id}</td>
        <td>{new Date(item.cdate).toLocaleString()}</td>
        <td>{item.customer?.name}</td>
        <td>{item.customer?.phone}</td>
        <td>{item.total}</td>
        <td>{item.status}</td>
      </tr>
    ));

    const items = this.state.order
      ? this.state.order.items.map((item, index) => (
        <tr key={item.product._id} className="datatable">
          <td>{index + 1}</td>
          <td>{item.product._id}</td>
          <td>{item.product.name}</td>
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
        </tr>
      ))
      : null;

    return (
      <div>
        <div className="align-center">
          <h2 className="text-center">CUSTOMER LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Active</th>
                <th>Action</th>
              </tr>
              {customers}
              {customers.length === 0 && (
                <tr><td colSpan="7">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {this.state.orders.length > 0 && (
          <div className="align-center">
            <h2 className="text-center">ORDER LIST</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>ID</th>
                  <th>Creation date</th>
                  <th>Cust. name</th>
                  <th>Cust. phone</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
                {orders}
              </tbody>
            </table>
          </div>
        )}

        {this.state.order && (
          <div className="align-center">
            <h2 className="text-center">ORDER DETAIL</h2>
            <table className="datatable" border="1">
              <tbody>
                <tr className="datatable">
                  <th>No.</th>
                  <th>Prod. ID</th>
                  <th>Prod. name</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
                {items}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  trCustomerClick(item) {
    this.setState({ orders: [], order: null });
    this.apiGetOrdersByCustID(item._id);
  }

  trOrderClick(item) {
    this.setState({ order: item });
  }

  lnkDeactiveClick(item) {
    this.apiPutCustomerDeactive(item._id);
  }

  lnkEmailClick(item) {
    this.apiGetCustomerSendmail(item._id);
  }

  async apiGetCustomers() {
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    try {
      const response = await axios.get('/api/admin/customers', config);
      this.setState({ customers: response.data });
    } catch (error) {
      alert(error.response?.data?.message || 'Cannot load customers');
    }
  }

  async apiPutCustomerDeactive(id) {
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    try {
      const response = await axios.put(`/api/admin/customers/deactive/${id}`, {}, config);
      if (response.data?.success) {
        await this.apiGetCustomers();
      } else {
        alert('Cannot deactivate customer');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Cannot deactivate customer');
    }
  }

  async apiGetCustomerSendmail(id) {
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    try {
      const response = await axios.get(`/api/admin/customers/sendmail/${id}`, config);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Cannot send activation email');
    }
  }

  async apiGetOrdersByCustID(cid) {
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    try {
      const response = await axios.get(`/api/admin/orders/customer/${cid}`, config);
      this.setState({ orders: response.data });
    } catch (error) {
      alert(error.response?.data?.message || 'Cannot load customer orders');
    }
  }
}

export default Customer;