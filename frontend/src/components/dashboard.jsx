import React, { useState } from 'react';
import { useAuth } from './AuthContext'; 
import { useNavigate } from 'react-router-dom'; 
import Home from './home';
import Upload from './upload';
import More from './more';
import Logo from '../assets/images/logo.png'; 

function Dashboard() {
    const [activeSection, setActiveSection] = useState('home'); 
    const { logout } = useAuth(); 
    const navigate = useNavigate(); 

    const renderContent = () => {
        switch (activeSection) {
            case 'home':
                return <Home />;
            case 'upload':
                return <Upload />;
            case 'more':
                return <More/>;
            default:
                return null;
        }
    };

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    return (
        <div className="flex h-screen bg-gray-800">
            <aside className="z-20 flex-shrink-0 hidden w-60 pl-2 overflow-y-auto bg-gray-800 md:block">
                <div className="text-white">
                    <div className="flex pt-8 bg-gray-800">
                    <img
                    src={Logo} 
                    style={{ height: '60px', width: 'auto' }}
                    alt="Logo"
                    className="mb-8 object-contain" 
                />
                <div className="flex py-2 px-2 items-center">
                            <p className="text-xl text-blue-500 font-semibold">AI powered</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <a
                            href="#"
                            onClick={() => setActiveSection('home')}
                            className={`flex items-center px-2 py-4 text-gray-100 hover:bg-gray-600 hover:rounded-lg ${activeSection === 'home' ? 'bg-gray-600 rounded-lg' : ''} mb-2`}
                        >
                            <span className="mr-3">
                                <span className="fas fa-home"></span>
                            </span>
                            <span>Home</span>
                        </a>
                        <a
                            href="#"
                            onClick={() => setActiveSection('upload')}
                            className={`flex items-center px-2 py-4 text-gray-100 hover:bg-gray-600 hover:rounded-lg ${activeSection === 'upload' ? 'bg-gray-600 rounded-lg' : ''} mb-2`}
                        >
                            <span className="mr-3">
                                <span className="fas fa-upload"></span>
                            </span>
                            <span>Upload Floor Plan</span>
                        </a>
                        <a
                            href="#"
                            onClick={() => setActiveSection('more')}
                            className={`flex items-center px-2 py-4 text-gray-100 hover:bg-gray-600 hover:rounded-lg ${activeSection === 'more' ? 'bg-gray-600 rounded-lg' : ''}`}
                        >
                            <span className="mr-3">
                                <span className="fas fa-chart-line"></span>
                            </span>
                            <span>More</span>
                        </a>
                    </div>
                </div>
            </aside>

            <div className="flex flex-col flex-1 w-full overflow-y-auto">
                <header className="z-40 py-4 bg-gray-800 flex justify-between items-center">
                    <ul className="flex items-center flex-shrink-0 space-x-6">
                    </ul>
                    <button
                        onClick={handleLogout}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-400 mr-8"
                    >
                        Logout
                    </button>
                </header>

                <main>{renderContent()}</main>
            </div>
        </div>
    );
}

export default Dashboard;
