import { Link  } from "react-scroll";
import { Link as RouterLink } from "react-router-dom";
import { FaRegArrowAltCircleRight } from "react-icons/fa";

const CardMatchLogo = () => {
  return (
    <div className="flex items-center gap-3">
      {/* Credit Card Icon */}
      <div className="w-8 h-6 border-2 border-white rounded-md relative">
        <div className="absolute top-1 left-1 w-3 h-2 bg-white rounded-sm"></div>
        <div className="absolute top-2 right-1 w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute top-3 right-1 w-1 h-1 bg-white rounded-full"></div>
      </div>
      
      {/* Text */}
      <div className="text-white font-semibold text-lg">
        <span>CardMatch</span>
        <span className="ml-1">
          <span className="text-white">A</span>
          <span className="text-white">I</span>
        </span>
      </div>
    </div>
  );
};

const NavBar = () => {
  return (
    <div className="w-full h-20 flex fixed bg-gray-950 border-b shadow-sm border-gray-800 z-50">
      <div className="relative flex w-full h-full px-6 py-2 items-center justify-between">
        {/* Logo */}
        <div className="h-full flex items-center">
          <CardMatchLogo />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 md:gap-12 lg:gap-16 items-center font-medium ml-auto mr-8">
          <Link
            to="home" smooth={true}
            className="text-white hover:cursor-pointer text-sm relative after:content-[''] after:block after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
          >
            Home
          </Link>

          <Link
            to="about"
            smooth={true}
            className="text-white hover:cursor-pointer text-sm relative after:content-[''] after:block after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
          >
            About
          </Link>

          <a
            href="https://www.capitalone.com/small-business/credit-cards/"
            className="text-white text-sm relative after:content-[''] after:block after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
          >
            Business
          </a>

          <a
            href="https://www.capitalone.com/credit-cards/fair-and-building/"
            className="text-white text-sm relative after:content-[''] after:block after:h-[2px] after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full"
          >
            Credit Building
          </a>
        </div>
        
        <RouterLink to="/login" className="px-4 md:px-6 py-2 md:py-3 text-white text-sm md:text-md flex items-center gap-x-2 justify-center font-medium border border-gray-400 rounded-xl hover:bg-white hover:text-black transition-colors duration-200">
          <h1 className="hidden sm:block">Find Your Match</h1>
          <h1 className="sm:hidden">Match</h1>
          <FaRegArrowAltCircleRight size={20} className="md:w-6 md:h-6 w-5 h-5" />
        </RouterLink>
      </div>
    </div>
  );
};

export default NavBar;
