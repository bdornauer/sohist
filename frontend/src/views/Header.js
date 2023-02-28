import React from 'react';
import {Container, Nav, Navbar} from "react-bootstrap";
import ReactLogo from "./assets/SoHist-Logo.svg";

export const Header = () => {
    return (
        <div>
            <Navbar bg="light" variant="light">
                <Container>
                    <Navbar.Brand  href="./">
                        <img
                            alt="Sohist"
                            src={ReactLogo}
                            width="200"
                            height="100"
                            className="d-inline-block align-top"
                        />{' '}
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <Nav.Link href="./">Analysis</Nav.Link>
                        <Nav.Link href="./analysisResults">Results Insides</Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
        </div>
    );
};