import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: '',
      cmbCategory: '',
      imgProduct: '',
    };
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      const item = this.props.item;
      this.setState({
        txtID: item ? item._id : '',
        txtName: item ? item.name : '',
        txtPrice: item ? item.price : '',
        cmbCategory: item ? item.category?._id : '',
        imgProduct: typeof item?.image === 'string' && item.image
          ? (item.image.startsWith('data:') ? item.image : 'data:image/jpeg;base64,' + item.image)
          : '',
      });
    }
  }

  render() {
    const categories = this.state.categories.map((category) => (
      <option key={category._id} value={category._id}>{category.name}</option>
    ));

    return (
      <div className="float-right">
        <h2 className="text-center">PRODUCT DETAIL</h2>
        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td><input type="text" value={this.state.txtID} readOnly /></td>
              </tr>
              <tr>
                <td>Name</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtName}
                    onChange={(e) => this.setState({ txtName: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Price</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={this.state.txtPrice}
                    onChange={(e) => this.setState({ txtPrice: e.target.value })}
                  />
                </td>
              </tr>
              <tr>
                <td>Image</td>
                <td>
                  <input
                    type="file"
                    name="fileImage"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => this.previewImage(e)}
                  />
                </td>
              </tr>
              <tr>
                <td>Category</td>
                <td>
                  <select
                    value={this.state.cmbCategory}
                    onChange={(e) => this.setState({ cmbCategory: e.target.value })}
                  >
                    <option value="">Select category</option>
                    {categories}
                  </select>
                </td>
              </tr>
              <tr>
                <td />
                <td>
                  <input type="submit" value="ADD NEW" onClick={(e) => this.btnAddClick(e)} />
                  <input type="submit" value="UPDATE" onClick={(e) => this.btnUpdateClick(e)} />
                  <input type="submit" value="DELETE" onClick={(e) => this.btnDeleteClick(e)} />
                </td>
              </tr>
              {this.state.imgProduct && (
                <tr>
                  <td colSpan="2">
                    <img src={this.state.imgProduct} width="300" height="300" alt="Product preview" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  getConfig() {
    return { headers: { 'x-access-token': this.context.token } };
  }

  previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => this.setState({ imgProduct: loadEvent.target.result });
    reader.readAsDataURL(file);
  }

  getProductPayload() {
    const name = this.state.txtName.trim();
    const price = Number(this.state.txtPrice);
    const image = this.state.imgProduct.includes(',')
      ? this.state.imgProduct.slice(this.state.imgProduct.indexOf(',') + 1)
      : this.state.imgProduct;
    if (!name || !this.state.txtPrice.trim() || !Number.isFinite(price) || price < 0 ||
      !this.state.cmbCategory || !image) {
      alert('Please input name, a valid price, category and image');
      return null;
    }
    return { name: name, price: price, category: this.state.cmbCategory, image: image };
  }

  btnAddClick(event) {
    event.preventDefault();
    const product = this.getProductPayload();
    if (product) this.apiPostProduct(product);
  }

  btnUpdateClick(event) {
    event.preventDefault();
    const product = this.getProductPayload();
    if (!this.state.txtID) {
      alert('Please select a product to update');
      return;
    }
    if (product) this.apiPutProduct(this.state.txtID, product);
  }

  btnDeleteClick(event) {
    event.preventDefault();
    if (!this.state.txtID) {
      alert('Please select a product to delete');
      return;
    }
    if (window.confirm('ARE YOU SURE?')) this.apiDeleteProduct(this.state.txtID);
  }

  refreshProducts() {
    axios.get('/api/admin/products?page=' + this.props.curPage, this.getConfig()).then((res) => {
      const result = res.data;
      this.props.updateProducts(result.products, result.noPages, result.curPage);
    }).catch(() => alert('Cannot refresh products'));
  }

  apiGetCategories() {
    axios.get('/api/admin/categories', this.getConfig()).then((res) => {
      this.setState({ categories: res.data });
    }).catch(() => alert('Cannot load categories'));
  }

  apiPostProduct(product) {
    axios.post('/api/admin/products', product, this.getConfig()).then((res) => {
      if (res.data && res.data._id) {
        this.setState({ txtID: '', txtName: '', txtPrice: '', cmbCategory: '', imgProduct: '' });
        this.props.clearSelection();
        this.refreshProducts();
      } else alert('Cannot add product');
    }).catch((err) => alert(err.response?.data?.message || 'Cannot add product'));
  }

  apiPutProduct(id, product) {
    axios.put('/api/admin/products/' + id, product, this.getConfig()).then((res) => {
      if (res.data && res.data._id) this.refreshProducts();
      else alert('Cannot update product');
    }).catch((err) => alert(err.response?.data?.message || 'Cannot update product'));
  }

  apiDeleteProduct(id) {
    axios.delete('/api/admin/products/' + id, this.getConfig()).then((res) => {
      if (res.data && res.data._id) {
        this.setState({ txtID: '', txtName: '', txtPrice: '', cmbCategory: '', imgProduct: '' });
        this.props.clearSelection();
        this.refreshProducts();
      } else alert('Cannot delete product');
    }).catch((err) => alert(err.response?.data?.message || 'Cannot delete product'));
  }
}

export default ProductDetail;