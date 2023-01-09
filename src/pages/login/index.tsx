import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import * as loginService from '../../services/loginService';
import "./style.scss";

const Login = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [openFormLogin, setOpenFormLogin] = useState(false);

  const onLogin = async () => {
    loginService.login(userName, password)
      .then(() => {
        navigate("/")
      })
      .catch((error: any) => {
        const data = error.response?.data;
        const msg = data?.msg || data?.message || "Something went wrong";
        alert(msg);
      });

  }

  useEffect(() => {
    const isLogin = loginService.checkLogin();

    if (!isLogin) {
      setOpenFormLogin(true);
      return;
    }

    navigate("/");
  }, []);

  return (
    <>
      {
        openFormLogin && (
          <section className="vh-100" style={{ backgroundColor: "#508bfc" }}>
            <div className="container py-5 h-100">
              <div className="row d-flex justify-content-center align-items-center h-100">
                <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                  <div className="card shadow-2-strong" style={{ borderRadius: "1rem" }}>
                    <div className="card-body p-5 text-center">

                      <h3 className="mb-5">Sign in</h3>

                      <div className="form-outline mb-4">
                        <input type="email" id="typeEmailX-2" className="form-control form-control-lg" onChange={(e) => setUserName(e.target.value)} />
                        <label className="form-label" htmlFor="typeEmailX-2">Username</label>
                      </div>

                      <div className="form-outline mb-4">
                        <input type="password" id="typePasswordX-2" className="form-control form-control-lg" onChange={(e) => setPassword(e.target.value)} />
                        <label className="form-label" htmlFor="typePasswordX-2" >Password</label>
                      </div>

                      <div className="form-check d-flex justify-content-start mb-4">
                        <input className="form-check-input" type="checkbox" value="" id="form1Example3" />
                        <label className="form-check-label" htmlFor="form1Example3"> Remember password </label>
                      </div>

                      <button className="btn btn-primary btn-lg btn-block" type="submit" onClick={onLogin}>Login</button>

                      <hr className="my-4" />

                      <button className="btn btn-lg btn-block btn-primary" style={{ backgroundColor: " #dd4b39" }}
                        type="submit"><i className="fab fa-google me-2"></i> Sign in with google</button>
                      <button className="btn btn-lg btn-block btn-primary mb-2" style={{ backgroundColor: "#3b5998" }}
                        type="submit"><i className="fab fa-facebook-f me-2"></i>Sign in with facebook</button>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      }
    </>
  );
};
export default Login;