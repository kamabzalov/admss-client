import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FormEvent, useState } from "react";

export default function SignIn() {

    const [validated, setValidationStatus] = useState(false);

    const login = (event: FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        if (!form.checkValidity()) {
            event.preventDefault();
        }

        setValidationStatus(true);
    };

    return (
        <Container>
            <section
                className="section register min-vh-100 d-flex flex-column align-items-center justify-content-center">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={6} lg={4}>
                            <Card className="mb-3">
                                <Card.Body>
                                    <Card.Title>
                                        <h2 className="text-center">Sign in</h2>
                                    </Card.Title>
                                    <Form noValidate validated={validated} onSubmit={login}>
                                        <Form.Group className="mb-3" controlId="userName">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control type="text" required placeholder="Enter username"/>
                                            <Form.Control.Feedback type="invalid">
                                                Invalid username.
                                            </Form.Control.Feedback>
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="userPassword">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control type="password" required placeholder="Password"/>
                                            <Form.Control.Feedback type="invalid">
                                                Invalid password.
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="rememberMe">
                                            <Form.Check type="checkbox" label="Remember me"/>
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="w-100 mb-3">
                                            Login
                                        </Button>
                                        <Col xs={12}>
                                            <p className="small mb-0">
                                                Don't have account?&nbsp;<Link to="/sign-up">Create an account</Link>
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
    )
}
