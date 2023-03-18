import { Button, Card, Col, Row } from 'react-bootstrap';

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
            </Row>
        </section>
    );
}
