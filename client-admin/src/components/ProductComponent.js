import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null,
    };
  }

  render() {
    const products = this.state.products.map((item) => {
      const imageValue = typeof item.image === 'string' ? item.image : '';
      const image = imageValue
        ? (imageValue.startsWith('data:') ? imageValue : 'data:image/jpeg;base64,' + imageValue)
        : '';
      return (
        <tr key={item._id} className="datatable" onClick={() => this.trItemClick(item)}>
          <td>{item._id}</td>
          <td>{item.name}</td>
          <td>{item.price}</td>
          <td>{new Date(item.cdate).toLocaleString()}</td>
          <td>{item.category?.name}</td>
          <td>{image ? <img src={image} width="100" height="100" alt={item.name} /> : 'No image'}</td>
        </tr>
      );
    });
    const pagination = Array.from({ length: this.state.noPages }, (_, index) => {
      const page = index + 1;
      return page === this.state.curPage ? (
        <span key={page}> | <b>{page}</b> | </span>
      ) : (
        <span key={page} className="link" onClick={() => this.lnkPageClick(page)}>
          | {page} |
        </span>
      );
    });

    return (
      <div>
        <div className="float-left">
          <h2 className="text-center">PRODUCT LIST</h2>
          <table className="datatable" border="1">
            <tbody>
              <tr className="datatable">
                <th>ID</th>
                <th>Name</th>
                <th>Price</th>
                <th>Creation date</th>
                <th>Category</th>
                <th>Image</th>
              </tr>
              {products}
              {products.length === 0 && (
                <tr><td colSpan="6">No products found</td></tr>
              )}
              <tr><td colSpan="6">{pagination}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="inline" />
        <ProductDetail
          item={this.state.itemSelected}
          curPage={this.state.curPage}
          updateProducts={this.updateProducts}
          clearSelection={this.clearSelection}
        />
        <div className="float-clear" />
      </div>
    );
  }

  componentDidMount() {
    this.apiGetProducts(1);
  }

  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  lnkPageClick(page) {
    this.apiGetProducts(page);
  }

  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + page, config).then((res) => {
      const result = res.data;
      this.updateProducts(result.products, result.noPages, result.curPage);
    }).catch(() => alert('Cannot load products'));
  }

  updateProducts = (products, noPages, curPage = this.state.curPage) => {
    this.setState((state) => ({
      products: products,
      noPages: noPages,
      curPage: curPage,
      itemSelected: state.itemSelected
        ? products.find((item) => item._id === state.itemSelected._id) || null
        : null,
    }));
  };

  clearSelection = () => {
    this.setState({ itemSelected: null });
  };
}

export default Product;