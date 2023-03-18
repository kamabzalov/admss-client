import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
    const [dealerName] = useState('Dealer name');
    return (
        <header className="header fixed-top d-flex align-items-center">
            <div className="d-flex align-items-center justify-content-between">
                <Link to="/dashboard" className="logo d-flex align-items-center">
                    <span className="d-none d-lg-block">{dealerName}</span>
                </Link>
            </div>
        </header>
    );
}
