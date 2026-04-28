import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthComplete.css';

function AuthComplete() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/storybook');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    const handleContinue = () => {
        navigate('/storybook');
    };

    return (
        <div id="AuthComplete">
            <div className="AuthCompleteContainer">
                <h2>Authentication Complete</h2>
                <p>Your Google Photos account is now connected.</p>
                <button onClick={handleContinue}>
                    Continue
                </button>
            </div>
        </div>
    );
}

export default AuthComplete;