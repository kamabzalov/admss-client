import { Accordion, Button, Card, Col, ListGroup, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <section>
            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Buyers & contacts center: common tasks</Card.Title>
                            <Card.Text>
                                Enter in a new buyer, or any other contact for which you would like to save an address
                                and phone number.
                            </Card.Text>
                            <Button variant="primary" className="me-1">
                                <i className="bi bi-envelope me-1"></i>
                                New contact
                            </Button>
                            <Button variant="primary" className="me-1">
                                <i className="bi bi-currency-dollar me-1"></i>
                                Pull quick credit
                            </Button>
                            <Button variant="primary" className="me-1">
                                <i className="bi bi-person-plus-fill me-1"></i>
                                Browse all
                            </Button>
                            <Button variant="primary" className="me-1">
                                <i className="bi bi-car-front me-1"></i>
                                New inventory
                            </Button>
                            <Button variant="primary" className="me-1">
                                <i className="bi bi-calculator-fill me-1"></i>
                                New deal
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>General tasks & settings</Card.Title>
                            <Accordion>
                                <Accordion.Item eventKey="0">
                                    <Accordion.Header>General tasks</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup as="ul">
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-people-fill me-1"></i>
                                                    View all contacts
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-person-plus-fill me-1"></i>
                                                    Add new contact
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    Pull quick credit report
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-x-circle-fill me-1"></i>
                                                    Delete a contact
                                                </Link>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="1">
                                    <Accordion.Header>Settings</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup as="ul">
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-gear-fill me-1"></i>
                                                    Change dealership address
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-gear-fill me-1"></i>
                                                    Change e-mail settings
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-gear-fill me-1"></i>
                                                    Add/Edit salespeople
                                                </Link>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="2">
                                    <Accordion.Header>Printing tasks</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup as="ul">
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-printer-fill me-1"></i>
                                                    Mailings and marketing
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-printer-fill me-1"></i>
                                                    Print reports
                                                </Link>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                                <Accordion.Item eventKey="3">
                                    <Accordion.Header>Advanced tasks</Accordion.Header>
                                    <Accordion.Body>
                                        <ListGroup as="ul">
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-file-arrow-up-fill me-1"></i>
                                                    Export customer data
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-check-circle-fill me-1"></i>
                                                    Recheck OFAC for all contacts
                                                </Link>
                                            </ListGroup.Item>
                                            <ListGroup.Item as="li">
                                                <Link to="/dashboard">
                                                    <i className="bi bi-envelope-at-fill me-1"></i>
                                                    Send an e-mail
                                                </Link>
                                            </ListGroup.Item>
                                        </ListGroup>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Recently entered or selected contact</Card.Title>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <Card.Title>Credit application</Card.Title>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </section>
    );
}
