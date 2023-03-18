import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function SignUp() {
  return (
    <Container>
      <section className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>
                    <h2 className="text-center">Sign up</h2>
                  </Card.Title>
                  <Form>
                    <Form.Group className="mb-3" controlId="userName">
                      <Form.Label>Username</Form.Label>
                      <Form.Control type="text" placeholder="Enter username" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="userEmail">
                      <Form.Label>Email</Form.Label>
                      <Form.Control type="email" placeholder="Enter email" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="userPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control type="password" placeholder="Password" />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="confirmPassword">
                      <Form.Label>Confirm password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirm password"
                      />
                    </Form.Group>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mb-3"
                    >
                      Sign up
                    </Button>
                    <Col xs={12}>
                      <p className="small mb-0">
                        Already have an account?&nbsp;
                        <Link to="/">Sign in</Link>
                      </p>
                    </Col>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </Container>
  );
}
