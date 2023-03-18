import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Container>
      <section className="section error-404 min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <h1>404</h1>
        <h2>The page you are looking for doesn't exist.</h2>
        <Link className="btn" to="/">
          Back to Home
        </Link>
      </section>
    </Container>
  );
}
