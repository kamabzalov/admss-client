import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';

interface RegisterForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignUp() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterForm>({
        mode: 'all',
        reValidateMode: 'onSubmit',
    });

    const registerUser: SubmitHandler<RegisterForm> = data => {};

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
                                    <Form noValidate onSubmit={handleSubmit(registerUser)}>
                                        <Form.Group className="mb-3" controlId="username">
                                            <Form.Label>Username</Form.Label>
                                            <Form.Control
                                                type="text"
                                                className={`${errors.username ? 'is-invalid' : ''}`}
                                                placeholder="Enter username"
                                                {...register('username', {
                                                    required: 'This field is required',
                                                    validate: {
                                                        notEmpty: v => !!v.trim() || 'This field is required',
                                                    },
                                                })}
                                            />
                                            {errors.username && (
                                                <Form.Text className="text-danger">{errors.username.message}</Form.Text>
                                            )}
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="email">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control
                                                type="email"
                                                className={`${errors.email ? 'is-invalid' : ''}`}
                                                placeholder="Enter email"
                                                {...register('email', {
                                                    required: 'This field is required',
                                                    validate: {
                                                        notEmpty: v => !!v.trim() || 'This field is required',
                                                    },
                                                })}
                                            />
                                            {errors.email && (
                                                <Form.Text className="text-danger">{errors.email.message}</Form.Text>
                                            )}
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="password">
                                            <Form.Label>Password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                className={`${errors.password ? 'is-invalid' : ''}`}
                                                placeholder="Enter password"
                                                {...register('password', {
                                                    required: 'This field is required',
                                                    validate: {
                                                        notEmpty: v => !!v.trim() || 'This field is required',
                                                    },
                                                })}
                                            />
                                            {errors.password && (
                                                <Form.Text className="text-danger">{errors.password.message}</Form.Text>
                                            )}
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="confirmPassword">
                                            <Form.Label>Confirm password</Form.Label>
                                            <Form.Control
                                                type="password"
                                                className={`${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                placeholder="Confirm password"
                                                {...register('confirmPassword', {
                                                    required: true,
                                                    validate: {
                                                        notEmpty: (v: string) => !!v.trim(),
                                                        isPasswordEqual: (v: string) =>
                                                            v === watch('password') || 'Passwords are not equal',
                                                    },
                                                })}
                                            />
                                            {errors.confirmPassword && (
                                                <Form.Text className="text-danger">
                                                    {errors.confirmPassword.message}
                                                </Form.Text>
                                            )}
                                        </Form.Group>
                                        <Button variant="primary" type="submit" className="w-100 mb-3">
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
