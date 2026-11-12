import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = { txtID: '', txtName: '' };
  }

  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      const item = this.props.item;
      this.setState({ txtID: item ? item._id : '', txtName: item ? item.name : '' });
    }
  }

  render() {
    return (
      <div className="float-right">
        <h2 className="text-center">CATEGORY DETAIL</h2>
        <form>
          <table>
            <tbody>
              <tr>
                <td>ID</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtID}
                    onChange={(e) => this.setState({ txtID: e.target.value })}
                  />
                </td>
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
                <td />
                <td>
                  <input type="submit" value="ADD NEW" onClick={(e) => this.btnAddClick(e)} />
                  <input type="submit" value="UPDATE" onClick={(e) => this.btnUpdateClick(e)} />
                  <input type="submit" value="DELETE" onClick={(e) => this.btnDeleteClick(e)} />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName.trim();
    if (name) this.apiPostCategory({ name: name });
    else alert('Please input name');
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const { txtID, txtName } = this.state;
    const name = txtName.trim();
    if (txtID && name) this.apiPutCategory(txtID, { name: name });
    else alert('Please input id and name');
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (!window.confirm('ARE YOU SURE?')) return;
    if (this.state.txtID) this.apiDeleteCategory(this.state.txtID);
    else alert('Please input id');
  }

  getConfig() {
    return { headers: { 'x-access-token': this.context.token } };
  }

  apiGetCategories() {
    axios.get('/api/admin/categories', this.getConfig()).then((res) => {
      this.props.updateCategories(res.data);
    }).catch(() => alert('Cannot load categories'));
  }

  apiPostCategory(category) {
    axios.post('/api/admin/categories', category, this.getConfig()).then((res) => {
      if (res.data && res.data._id) {
        alert('SUCCESS!');
        this.setState({ txtID: '', txtName: '' });
        this.apiGetCategories();
      } else alert('FAIL!');
    }).catch((err) => alert(err.response?.data?.message || 'FAIL!'));
  }

  apiPutCategory(id, category) {
    axios.put('/api/admin/categories/' + id, category, this.getConfig()).then((res) => {
      if (res.data && res.data._id) {
        alert('SUCCESS!');
        this.apiGetCategories();
      } else alert('FAIL!');
    }).catch((err) => alert(err.response?.data?.message || 'FAIL!'));
  }

  apiDeleteCategory(id) {
    axios.delete('/api/admin/categories/' + id, this.getConfig()).then((res) => {
      if (res.data && res.data._id) {
        alert('SUCCESS!');
        this.setState({ txtID: '', txtName: '' });
        this.apiGetCategories();
      } else alert('FAIL!');
    }).catch((err) => alert(err.response?.data?.message || 'FAIL!'));
  }
}

export default CategoryDetail;