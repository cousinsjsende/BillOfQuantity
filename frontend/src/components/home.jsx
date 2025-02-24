import React from "react";
import Image1 from '../assets/images/house-1836070_1280.jpg';
import Logo from '../assets/images/logo.png'; 

function Home() {
    return (
        <div 
            className="relative flex flex-col items-center justify-start min-h-screen border-4 border-blue-600 rounded-2xl" 
            style={{
                backgroundImage: `url(${Image1})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="absolute inset-0 bg-black opacity-70 rounded-2xl" /> 
            
            <div className="relative z-10 flex flex-col items-center p-5 pt-3">
                <img
                    src={Logo} 
                    style={{ height: '150px', width: 'auto' }}
                    alt="Logo"
                    className="mb-8 object-contain" 
                />
                <div className="px-20 pt-6">
                <h2 className="text-white text-2xl font-bold text-center leading-10 tracking-widest">
                Introducing our cutting-edge Machine Learning enabled Estimation Bill of Quantities system

                </h2>
                </div>
                
            </div>
        </div>
    );
}

export default Home;
