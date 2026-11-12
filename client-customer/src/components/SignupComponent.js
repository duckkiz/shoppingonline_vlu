import axios from 'axios';
import React, { Component } from 'react';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: ''
    };
  }

  render() {
    return (
      <div className="align-center">
        <h2 className="text-center">SIGN-UP</h2>

        <form onSubmit={(e) => this.btnSignupClick(e)}>
          <table className="align-center">
            <tbody>
              <tr>
                <td>Username</td>
                <td>
                  <input
                    type="text"
                    value={this.state.txtUsername}
                    onChange={(e) => this.setState({ txtUsername: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td>Password</td>
                <td>
                  <input
                    type="password"
                    value={this.state.txtPassword}
                    onChange={(e) => this.setState({ txtPassword: e.target.value })}
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
                <td>Phone</td>
                <td>
                  <input
                    type="tel"
                    value={this.state.txtPhone}
                    onChange={(e) => this.setState({ txtPhone: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td>Email</td>
                <td>
                  <input
                    type="email"
                    value={this.state.txtEmail}
                    onChange={(e) => this.setState({ txtEmail: e.target.value })}
                  />
                </td>
              </tr>

              <tr>
                <td />
                <td>
                  <input type="submit" value="SIGN-UP" />
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    );
  }

  btnSignupClick(e) {
    e.preventDefault();

    const { txtUsername, txtPassword, txtName, txtPhone, txtEmail } = this.state;
    if (txtUsername && txtPassword && txtName && txtPhone && txtEmail) {
      this.apiSignup({
        username: txtUsername,
        password: txtPassword,
        name: txtName,
        phone: txtPhone,
        email: txtEmail
      });
    } else {
      alert('Please input username and password and name and phone and email');
    }
  }

  async apiSignup(account) {
    try {
      const response = await axios.post('/api/customer/signup', account);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Sign-up failed. Please try again.');
    }
  }
}

export default Signup;
