import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <div className="p-4 bg-black h-[100px] max-w-5x1 mx-auto flex items-center border border-gray-200 rounded-[30px]">
        <span className="text-white text-[50px]">BookIT</span>
        <div className="flex w-[300px] justify-center ml-[60%]">
          <Link to="/">
            <div className="bg-white w-[100px] h-[40px] flex justify-center items-center rounded-lg">
              <span className="text-black">Map</span>
            </div>
          </Link>
          <Link to="/profile">
            <div className="bg-white w-[100px] h-[40px] flex justify-center items-center rounded-lg ml-[20px]">
              <span className="text-black">Profile</span>
            </div>
          </Link>
        </div>
    </div>
  );
};

export default Header;
