import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

interface LoginForm {
    username: string;
    password: string;
    rememberMe: boolean
}

export default function SignIn() {

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        mode: "all",
        reValidateMode: "onSubmit",
    });

    const login: SubmitHandler<LoginForm> = (data) => {
        
    }

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
                                    <Form noValidate onSubmit={handleSubmit(login)}>
                                        <Form.Group className="mb-3" controlId="userName">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control type="text" required
                                                          className={`${errors.username ? "is-invalid" : ""}`}
                                                          placeholder="Enter username" {...register('username',
                                                {
                                                    required: true,
                                                    validate: { notEmpty: v => !!v.trim() }
                                                })} />
                                            {errors.username && (
                                                <Form.Text className="text-danger">
                                                    Invalid username
                                                </Form.Text>
                                            )}
                                        </Form.Group>

                                        <Form.Group className="mb-3" controlId="userPassword">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control type="password" required
                                                          className={`${errors.password ? "is-invalid" : ""}`}
                                                          placeholder="Password" {...register('password', {
                                                required: true,
                                                validate: { notEmpty: v => !!v.trim() }
                                            })} />
                                            {errors.password && (
                                                <Form.Text className="text-danger">
                                                    Invalid password
                                                </Form.Text>
                                            )}


                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="rememberMe">
                                            <Form.Check type="checkbox" {...register('rememberMe')}
                                                        label="Remember me"/>
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
