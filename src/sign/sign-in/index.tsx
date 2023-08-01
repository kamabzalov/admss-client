import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";

interface LoginForm {
  username: string;
  password: string;
  rememberMe: boolean;
}

export default function SignIn() {
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      username: "",
      password: ""
    },
    validate: (data: { username: string, password: string }) => {
      let errors: any = {};

      if (!data.username.trim()) {
        errors.username = "Username is required.";
      }

      if (!data.password.trim()) {
        errors.password = "Password is required.";
      }

      return errors;
    },
    onSubmit: () => {
      navigate('/dashboard');
    },
  });

  return (
    <section className="sign">
      <div className="sign-in">
        <h1 className="sign__title">Sign In</h1>
        <form onSubmit={formik.handleSubmit}>
          <div className="m-b-15">
            <div className="p-input-icon-right w-full">
              <i className="admss-icon-username sign__icon" />
              <InputText className="sign__input" id="username" onChange={formik.handleChange}
                         value={formik.values.username} />
              {formik.errors.username ? <div>{formik.errors.username}</div> : null}
            </div>
          </div>

          <div className="m-b-10">
            <div className="p-input-icon-right w-full">
              <i className="admss-icon-password sign__icon" />
              <InputText className="sign__input" id="password" type="password" onChange={formik.handleChange}
                         value={formik.values.password} />
              {formik.errors.password ? <div>{formik.errors.password}</div> : null}
            </div>
          </div>

          <div className="flex justify-content-between m-b-40 user-help">
            <div className="flex align-items-center">
              <Checkbox inputId="remember" name="remember" checked={false} />
              <label htmlFor="remember" className="ml-2 user-help__label">
                Remember me
              </label>
            </div>
            <Link className="user-help__link" to="/">
              Forgot password?
            </Link>
          </div>
          <p className="text-center">
            <Button label="Sign in" severity="success" type="submit" className="sign__button" />
          </p>
        </form>
      </div>
    </section>
  );
}
