import axios from 'axios';
import React, { Component } from 'react';

class Active extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtToken: ''
    };
  }

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">ACTIVE ACCOUNT</h2>

        <form onSubmit={(e) => this.btnActiveClick(e)}>
          <table className="align-center">
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
                <td>Token</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtToken}
                    onChange={(e) => this.setState({ txtToken: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td />
                <td>
                  <input type="submit" value="ACTIVE" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnActiveClick(e) {
    e.preventDefault();

    const { txtID, txtToken } = this.state;
    if (txtID && txtToken) {
      this.apiActive(txtID, txtToken);
    } else {
      alert('Please input id and token');
    }
  }

  async apiActive(id, token) {
    try {
      const response = await axios.post('/api/customer/active', { id, token });
      alert(response.data ? 'OK BABY!' : 'SORRY BABY!');
    } catch (error) {
      alert(error.response?.data?.message || 'Account activation failed. Please try again.');
    }
  }
}

export default Active;
