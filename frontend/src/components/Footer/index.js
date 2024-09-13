import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex flex-col items-center">
        <div className="flex space-x-4 mb-2">
          <a
            href="https://github.com/Popachka"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-300"
            aria-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 496 512"
              className="w-5 h-5"
            >
              {/* SVG path for GitHub icon */}
              <path d="M248 8C111.1 8 0 119.1 0 256c0 109.7 71.3 202.7 169.8 235.4 12.4 2.3 16.9-5.4 16.9-11.9v-21.3c-68.9 15.1-83.5-33.2-83.5-33.2-11.3-28.7-27.6-36.3-27.6-36.3-22.6-15.5 1.7-15.2 1.7-15.2 25.1 1.8 38.2 25.8 38.2 25.8 22.4 38.4 58.7 27.3 72.9 20.9 2.2-16.2 8.7-27.3 15.8-33.7-55.5-6.3-113.2-27.8-113.2-123.2 0-27.2 9.7-49.4 25.6-67.1-2.6-6.3-11.1-30.6 2.4-63.8 0 0 20.8-6.6 68.1 25.3 19.7-5.5 40.9-8.3 62.0-8.3 21.1 0 42.3 2.8 62.0 8.3 47.3-31.9 68.1-25.3 68.1-25.3 13.5 33.2 5 57.5 2.4 63.8 15.9 17.7 25.6 39.9 25.6 67.1 0 95.5-57.8 116.9-113.4 123.1 8.9 7.7 16.8 22.8 16.8 46.1v68.5c0 6.5 4.5 14.3 16.9 11.9C426.7 458.7 496 365.7 496 256 496 119.1 384.9 8 248 8z" />
            </svg>
          </a>
          <a
            href="https://vk.com/spichkin_tut"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-700 hover:bg-blue-600 transition duration-300"
            aria-label="VK"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 448 512"
              className="w-5 h-5"
            >
              {/* SVG path for VK icon */}
              <path d="M297.4 315.1c-5.4-4.6-12.3-7.5-18.7-7.5-7.3 0-13.8 4.7-17.5 12.6-2.9 5.7-4.2 12.7-4.5 20.1-0.4 9.1 2.7 15.6 8.3 20.1 4.4 3.7 10.1 5.5 16.3 5.5 6.5 0 13.3-4.8 17.2-11.6 3.6-6.1 5.3-13.6 4.7-21.1-0.4-6.7-2.6-12.3-6.9-16.6zm-97.7-2.8c-5.4-4.6-12.3-7.5-18.7-7.5-7.3 0-13.8 4.7-17.5 12.6-2.9 5.7-4.2 12.7-4.5 20.1-0.4 9.1 2.7 15.6 8.3 20.1 4.4 3.7 10.1 5.5 16.3 5.5 6.5 0 13.3-4.8 17.2-11.6 3.6-6.1 5.3-13.6 4.7-21.1-0.4-6.7-2.6-12.3-6.9-16.6zM16 47.2c0-14.3 11.6-25.8 25.8-25.8H406c14.3 0 25.8 11.6 25.8 25.8v417.6c0 14.3-11.6 25.8-25.8 25.8H41.8c-14.3 0-25.8-11.6-25.8-25.8V47.2zM64 64h320c8.7 0 16 7.3 16 16v369.6c0 8.7-7.3 16-16 16H64c-8.7 0-16-7.3-16-16V80c0-8.7 7.3-16 16-16zm106.3 55.3c-0.8 4.6-0.9 10.1-0.9 16v24h40.2v-14.4c0-17.6 1.4-31.3 6.7-39.6 4.5-7.5 11.2-11.9 18.4-11.9 7.5 0 13.3 3.4 17.2 8.7 3.9 5.3 5.7 13.4 5.7 23.3v27h40.2v-24.3c0-15.7-1.4-30.2-7-40.2-5.5-10.4-13.9-16.2-23.9-16.2-9.7 0-17.1 4.5-22.7 12.3-5.5 7.5-7.7 16.4-7.7 27.2zM150 118.2c-0.8 4.6-0.9 10.1-0.9 16v24h40.2v-14.4c0-17.6 1.4-31.3 6.7-39.6 4.5-7.5 11.2-11.9 18.4-11.9 7.5 0 13.3 3.4 17.2 8.7 3.9 5.3 5.7 13.4 5.7 23.3v27h40.2v-24.3c0-15.7-1.4-30.2-7-40.2-5.5-10.4-13.9-16.2-23.9-16.2-9.7 0-17.1 4.5-22.7 12.3-5.5 7.5-7.7 16.4-7.7 27.2z" />
            </svg>
          </a>
        </div>
        <div className="text-center text-gray-400 text-sm">
          © 2023 Copyright:
          <a
            href="https://vk.com/spichkin_tut"
            className="text-blue-400 hover:text-blue-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            SPICHKIN_TUT
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
